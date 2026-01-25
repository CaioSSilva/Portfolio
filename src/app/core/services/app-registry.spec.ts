import { TestBed } from '@angular/core/testing';

import { AppRegistry } from './app-registry';

describe('AppRegistry', () => {
  let service: AppRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppRegistry);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
