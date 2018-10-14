import { TestBed } from '@angular/core/testing';

import { App.ConfigService } from './app.config.service';

describe('App.ConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: App.ConfigService = TestBed.get(App.ConfigService);
    expect(service).toBeTruthy();
  });
});
