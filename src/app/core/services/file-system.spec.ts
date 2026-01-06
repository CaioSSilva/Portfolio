import { TestBed } from '@angular/core/testing';

import { FileSystem } from './file-system';

describe('FileSystem', () => {
  let service: FileSystem;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileSystem);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
