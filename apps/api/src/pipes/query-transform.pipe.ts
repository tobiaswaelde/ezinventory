import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import * as qs from 'qs';
import { ObjectUtil } from '~/util/object';

@Injectable()
export class QueryTransformPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'query' && typeof value === 'object') {
      return ObjectUtil.parse(
        qs.parse(value, {
          depth: 10,
        }),
      );
    }
    return value;
  }
}
