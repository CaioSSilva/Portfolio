import { TestBed } from '@angular/core/testing';

import { Apps } from './apps';

describe('Apps', () => {
  let service: Apps;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Apps);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
