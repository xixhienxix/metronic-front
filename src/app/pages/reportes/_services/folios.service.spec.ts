import { TestBed } from '@angular/core/testing';

import { FoliosService } from './folios.service';

describe('FoliosService', () => {
  let service: FoliosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoliosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
