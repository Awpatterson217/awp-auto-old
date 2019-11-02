import { TestBed } from '@angular/core/testing';

import { ProvisionService } from './provision.service';

describe('ProvisionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProvisionService = TestBed.get(ProvisionService);
    expect(service).toBeTruthy();
  });
});
