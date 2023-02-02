import { HttpStatus } from '@nestjs/common';

export class Err extends Error {
  constructor(public what: string, private status: number) {
    super();
  }

  getStatus() {
    return this.status;
  }
}

export class ErrNotFound extends Err {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}
export class ErrConflict extends Err {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}
export class ErrUnAuthorized extends Err {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ErrForbidden extends Err {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ErrBadRequest extends Err {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
