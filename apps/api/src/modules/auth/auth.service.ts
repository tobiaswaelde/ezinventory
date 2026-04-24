import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MfaService } from '~/modules/auth/mfa/mfa.service';
import { PrismaService } from '~/prisma/prisma.service';
import { AuthRequest } from '~/types/auth-request';
import { ErrorCode } from '~/types/error-code';
import { AuthResultDTO } from '~/types/modules/auth/auth-result.dto';
import { SigninDTO } from '~/types/modules/auth/signin.dto';
import { UserPayload } from '~/types/modules/user';
import { UserDTO } from '~/types/modules/user/user.dto';
import { CryptoUtil } from '~/util/crypto';

@Injectable()
export class AuthService {
  public static readonly token = 'AUTH_SERVICE';

  constructor(
    private readonly db: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(MfaService.token) private readonly mfaService: MfaService,
  ) {}

  /**
   * Validate user credentials
   * @param {string} email The user's email
   * @param {string} password The user's password
   * @returns {UserPayload} The user payload if the credentials are correct.
   * @throws {UnauthorizedException} ErrorCode.AuthInvalidCredentials
   * @throws {UnauthorizedException} ErrorCode.Unauthorized
   */
  public async validateUser(email: string, password: string): Promise<UserPayload> {
    // check if user exists
    const user = await this.db.user.findUnique({
      where: { email },
      include: { profile: true, preferences: true },
    });
    if (!user) {
      throw new UnauthorizedException(ErrorCode.AuthInvalidCredentials);
    }

    // check if password is correct
    const isValidPassword = await CryptoUtil.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException(ErrorCode.AuthInvalidCredentials);
    }

    // return user
    delete user.password;
    return user;
  }

  /**
   * Handles sign in with credentials.
   *
   * If MFA is enabled, the user must provide a valid TOTP. If MFA is not yet pending, returns an auth result with a temporary token.
   * @param {AuthRequest} req The request object.
   * @param {SigninDTO} data The sign-in data.
   * @returns {AuthResultDTO} The authentication result.
   * @throws {ForbiddenException} ErrorCode.AuthNoTokenProvided
   * @throws {ForbiddenException} ErrorCode.AuthInvalidToken
   * @throws {BadRequestException} ErrorCode.AuthMfaNotPending
   * @throws {UnauthorizedException} ErrorCode.AuthMfaInvalidCode
   */
  public async signinWithCredentials(req: AuthRequest, data: SigninDTO): Promise<AuthResultDTO> {
    // check MFA
    if (req.user.isMfaEnabled) {
      // check if TOTP is provided & MFA is pending
      if (data.totp) {
        // extract token from header
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new ForbiddenException(ErrorCode.AuthNoTokenProvided);
        const [, tmpToken] = authHeader.split(' ');

        // verify token
        let payload: JwtPayloadMfa;
        try {
          payload = await this.jwtService.verifyAsync(tmpToken);
        } catch {
          throw new ForbiddenException(ErrorCode.AuthInvalidToken);
        }

        // check if MFA is pending
        if (!payload.mfaPending) {
          throw new BadRequestException(ErrorCode.AuthMfaNotPending);
        }

        // verify TOTP
        const ok = await this.mfaService.verifyToken(data.totp, req.user.mfaSecret);
        if (!ok) {
          throw new UnauthorizedException(ErrorCode.AuthMfaInvalidCode);
        }
      } else {
        // create a short lived token
        const payload: JwtPayloadMfa = {
          sub: req.user.id,
          email: req.user.email,
          mfaPending: true,
        };
        const tmpToken = await this.jwtService.signAsync(payload, { expiresIn: '5m' });
        return new AuthResultDTO({
          token: tmpToken,
          mfaPending: true,
        });
      }
    }

    return this.signinUser(req.user);
  }

  /**
   * Sign in a user and return a JWT token
   * @param {UserPayload} user The user payload
   * @returns {AuthResultDTO} The authentication result
   */
  public async signinUser(user: UserPayload): Promise<AuthResultDTO> {
    const token = await this.generateJwt(user);

    return new AuthResultDTO({
      user: await UserDTO.fromModel(user),
      token: token,
      mfaPending: false,
    });
  }

  /**
   * Generate & sign JWT
   * @param {UserPayload} user The user payload
   * @returns {string} The signed JWT
   */
  private async generateJwt(user: UserPayload): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
  }
}
