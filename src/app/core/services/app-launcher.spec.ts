import { TestBed } from '@angular/core/testing';

import { AppLauncher } from './app-launcher';

describe('AppLauncher', () => {
  let service: AppLauncher;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppLauncher);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
