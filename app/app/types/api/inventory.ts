export type IconSet = 'TABLER' | 'LUCIDE';
export type ContainerType = 'SHELF' | 'BOX' | 'FRIDGE' | 'BIN' | 'CUSTOM';

export type CreateLocationPayload = {
  name: string;
  code: string;
  description?: string;
  iconSet?: IconSet;
  iconName?: string;
};

export type LocationResponse = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  iconSet: IconSet | null;
  iconName: string | null;
  isActive: boolean;
};

export type CreateContainerPayload = {
  locationId: string;
  parentContainerId?: string;
  type: ContainerType;
  name: string;
  code: string;
  description?: string;
  iconSet?: IconSet;
  iconName?: string;
};

export type ContainerResponse = {
  id: string;
  locationId: string;
  parentContainerId: string | null;
  type: ContainerType;
  name: string;
  code: string;
  qrCodeValue: string;
  description: string | null;
  iconSet: IconSet | null;
  iconName: string | null;
  isActive: boolean;
};
