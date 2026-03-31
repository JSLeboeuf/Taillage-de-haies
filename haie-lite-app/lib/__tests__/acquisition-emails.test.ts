/**
 * Tests for acquisition email sequencing
 */

import {
  getAcquisitionEmail,
  getNextEmailDelay,
  isSequenceComplete,
  getSequenceCompletionDate,
  AcquisitionProspect,
} from "../acquisition-emails";

describe("Acquisition Email Sequences", () => {
  const mockProspect: AcquisitionProspect = {
    id: "test-123",
    company_name: "Test Corp",
    contact_email: "contact@test.com",
    owner_email: "owner@haielite.ca",
    sequence_type: "cold",
    sequence_step: 0,
    priority: 10,
    status: "new",
    next_email_at: null,
  };

  describe("Cold Sequence", () => {
    it("should return email for step 1", () => {
      const email = getAcquisitionEmail(mockProspect, "cold", 1);
      expect(email).not.toBeNull();
      expect(email?.subject).toContain("Expansion");
      expect(email?.html).toContain("Test Corp");
    });

    it("should return email for step 2", () => {
      const email = getAcquisitionEmail(mockProspect, "cold", 2);
      expect(email).not.toBeNull();
      expect(email?.subject).toContain("Suivant");
    });

    it("should return email for step 3", () => {
      const email = getAcquisitionEmail(mockProspect, "cold", 3);
      expect(email).not.toBeNull();
      expect(email?.subject).toContain("3e contact");
    });

    it("should return email for step 4", () => {
      const email = getAcquisitionEmail(mockProspect, "cold", 4);
      expect(email).not.toBeNull();
      expect(email?.subject).toContain("Dernier");
    });

    it("should return email for step 5", () => {
      const email = getAcquisitionEmail(mockProspect, "cold", 5);
      expect(email).not.toBeNull();
      expect(email?.subject).toContain("Suivi");
    });

    it("should return null for step 6 (sequence complete)", () => {
      const email = getAcquisitionEmail(mockProspect, "cold", 6);
      expect(email).toBeNull();
    });
  });

  describe("Warm Sequence", () => {
    it("should return 4 emails", () => {
      for (let step = 1; step <= 4; step++) {
        const email = getAcquisitionEmail(mockProspect, "warm", step);
        expect(email).not.toBeNull();
      }

      const emailAfter = getAcquisitionEmail(mockProspect, "warm", 5);
      expect(emailAfter).toBeNull();
    });
  });

  describe("Blast Sequence", () => {
    it("should return 3 emails", () => {
      for (let step = 1; step <= 3; step++) {
        const email = getAcquisitionEmail(mockProspect, "blast", step);
        expect(email).not.toBeNull();
      }

      const emailAfter = getAcquisitionEmail(mockProspect, "blast", 4);
      expect(emailAfter).toBeNull();
    });
  });

  describe("Nurture Sequence", () => {
    it("should return 2 emails", () => {
      for (let step = 1; step <= 2; step++) {
        const email = getAcquisitionEmail(mockProspect, "nurture", step);
        expect(email).not.toBeNull();
      }

      const emailAfter = getAcquisitionEmail(mockProspect, "nurture", 3);
      expect(emailAfter).toBeNull();
    });
  });

  describe("Email Delays", () => {
    it("should return correct delays for cold sequence", () => {
      expect(getNextEmailDelay("cold", 1)).toBe(3);
      expect(getNextEmailDelay("cold", 2)).toBe(4);
      expect(getNextEmailDelay("cold", 3)).toBe(5);
      expect(getNextEmailDelay("cold", 4)).toBe(10);
      expect(getNextEmailDelay("cold", 5)).toBe(90);
      expect(getNextEmailDelay("cold", 6)).toBeNull();
    });

    it("should return correct delays for warm sequence", () => {
      expect(getNextEmailDelay("warm", 1)).toBe(2);
      expect(getNextEmailDelay("warm", 2)).toBe(3);
      expect(getNextEmailDelay("warm", 3)).toBe(7);
      expect(getNextEmailDelay("warm", 4)).toBe(90);
      expect(getNextEmailDelay("warm", 5)).toBeNull();
    });

    it("should return correct delays for blast sequence", () => {
      expect(getNextEmailDelay("blast", 1)).toBe(1);
      expect(getNextEmailDelay("blast", 2)).toBe(1);
      expect(getNextEmailDelay("blast", 3)).toBe(30);
      expect(getNextEmailDelay("blast", 4)).toBeNull();
    });

    it("should return correct delays for nurture sequence", () => {
      expect(getNextEmailDelay("nurture", 1)).toBe(90);
      expect(getNextEmailDelay("nurture", 2)).toBe(90);
      expect(getNextEmailDelay("nurture", 3)).toBeNull();
    });
  });

  describe("Sequence Completion", () => {
    it("should mark cold sequence as complete after step 5", () => {
      expect(isSequenceComplete("cold", 5)).toBe(false);
      expect(isSequenceComplete("cold", 6)).toBe(true);
    });

    it("should mark warm sequence as complete after step 4", () => {
      expect(isSequenceComplete("warm", 4)).toBe(false);
      expect(isSequenceComplete("warm", 5)).toBe(true);
    });

    it("should mark blast sequence as complete after step 3", () => {
      expect(isSequenceComplete("blast", 3)).toBe(false);
      expect(isSequenceComplete("blast", 4)).toBe(true);
    });

    it("should mark nurture sequence as complete after step 2", () => {
      expect(isSequenceComplete("nurture", 2)).toBe(false);
      expect(isSequenceComplete("nurture", 3)).toBe(true);
    });
  });

  describe("Sequence Completion Dates", () => {
    it("should calculate correct completion date for cold sequence starting at step 0", () => {
      // 3 + 4 + 5 + 10 + 90 = 112 days
      const completionDate = getSequenceCompletionDate("cold", 0);
      const now = new Date();
      const expectedDate = new Date(now.getTime() + 112 * 24 * 60 * 60 * 1000);

      // Allow 1 day tolerance for timezone differences
      const difference = Math.abs(
        completionDate.getTime() - expectedDate.getTime(),
      );
      expect(difference).toBeLessThan(24 * 60 * 60 * 1000);
    });

    it("should calculate correct completion date for warm sequence starting at step 0", () => {
      // 2 + 3 + 7 + 90 = 102 days
      const completionDate = getSequenceCompletionDate("warm", 0);
      const now = new Date();
      const expectedDate = new Date(now.getTime() + 102 * 24 * 60 * 60 * 1000);

      const difference = Math.abs(
        completionDate.getTime() - expectedDate.getTime(),
      );
      expect(difference).toBeLessThan(24 * 60 * 60 * 1000);
    });
  });

  describe("Email Content", () => {
    it("should include prospect company name in cold sequence step 1", () => {
      const email = getAcquisitionEmail(mockProspect, "cold", 1);
      expect(email?.html).toContain("Test Corp");
    });

    it("should include baseline URL links in all emails", () => {
      const sequences: Array<AcquisitionProspect["sequence_type"]> = [
        "cold",
        "warm",
        "blast",
        "nurture",
      ];

      for (const seq of sequences) {
        const email = getAcquisitionEmail(mockProspect, seq, 1);
        expect(email?.html).toContain("https://haielite.ca");
      }
    });

    it("should have proper HTML structure with subject and content", () => {
      const email = getAcquisitionEmail(mockProspect, "cold", 1);
      expect(email?.subject).toBeTruthy();
      expect(email?.html).toContain("<h2>");
      expect(email?.html).toContain("<p>");
    });
  });
});
