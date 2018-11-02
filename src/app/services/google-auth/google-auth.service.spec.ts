import { TestBed } from '@angular/core/testing';

import { GoogleAuthService } from './google-auth.service';

describe('GoogleAuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GoogleAuthService = TestBed.get(GoogleAuthService);
    expect(service).toBeTruthy();
  });
});
