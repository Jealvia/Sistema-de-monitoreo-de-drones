import { TestBed } from '@angular/core/testing';

import { DronService } from './dron.service';

describe('DronService', () => {
  let service: DronService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DronService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
