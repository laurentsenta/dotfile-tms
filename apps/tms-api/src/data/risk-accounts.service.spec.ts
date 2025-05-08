import { Test, TestingModule } from '@nestjs/testing';
import { RiskAccountsService, HIGH_RISK_ACCOUNTS } from './risk-accounts.service';

describe('RiskAccountsService', () => {
  let service: RiskAccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiskAccountsService],
    }).compile();

    service = module.get<RiskAccountsService>(RiskAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true for accounts in the high-risk list', () => {
    // Test a few accounts from the HIGH_RISK_ACCOUNTS list
    expect(service.match(HIGH_RISK_ACCOUNTS[0])).toBe(true);
    expect(service.match(HIGH_RISK_ACCOUNTS[3])).toBe(true);
    expect(service.match(HIGH_RISK_ACCOUNTS[HIGH_RISK_ACCOUNTS.length - 1])).toBe(true);
  });

  it('should return false for accounts not in the high-risk list', () => {
    expect(service.match('regular-account-001')).toBe(false);
    expect(service.match('non-existent-merchant')).toBe(false);
    expect(service.match('')).toBe(false);
  });
});
