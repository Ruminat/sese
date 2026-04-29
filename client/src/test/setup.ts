import { beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.restoreAllMocks();
});

if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => "blob:mock-url");
}

if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = vi.fn();
}
