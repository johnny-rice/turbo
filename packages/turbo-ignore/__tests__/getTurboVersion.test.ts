import { spyConsole } from "@turbo/test-utils";
import { describe, it, expect } from "@jest/globals";
import { getTurboVersion } from "../src/getTurboVersion";

describe("getWorkspace()", () => {
  const mockConsole = spyConsole();
  it("getTurboVersion returns turboVersion from arg", () => {
    expect(
      getTurboVersion(
        {
          turboVersion: "1.2.3",
        },
        "./__fixtures__/app"
      )
    ).toEqual("1.2.3");

    expect(mockConsole.log).toHaveBeenNthCalledWith(
      1,
      "≫  ",
      'Using turbo version "1.2.3" from arguments'
    );
  });

  it("getTurboVersion returns version from package.json", () => {
    expect(getTurboVersion({}, "./__fixtures__/turbo_in_deps")).toEqual("^99");
    expect(mockConsole.log).toHaveBeenCalledWith(
      "≫  ",
      'Inferred turbo version "^99" from "package.json"'
    );
  });

  it("getTurboVersion infers ^2 if tasks in turbo.json", () => {
    expect(getTurboVersion({}, "./__fixtures__/no_turbo_deps")).toEqual("^2");
    expect(mockConsole.log).toHaveBeenCalledWith(
      "≫  ",
      'Inferred turbo version ^2 based on "tasks" in "turbo.json"'
    );
  });

  it("getTurboVersion infers ^1 if pipeline in turbo.json", () => {
    expect(getTurboVersion({}, "./__fixtures__/no_turbo_deps_v1")).toEqual(
      "^1"
    );
    expect(mockConsole.log).toHaveBeenCalledWith(
      "≫  ",
      'Inferred turbo version ^1 based on "pipeline" in "turbo.json"'
    );
  });

  it("getTurboVersion return null if no turbo.json", () => {
    expect(getTurboVersion({}, "./__fixtures__/app")).toEqual(null);
    expect(mockConsole.error).toHaveBeenCalledWith(
      "≫  ",
      '"__fixtures__/app/turbo.json" could not be read. turbo-ignore turbo version inference failed'
    );
  });

  it("getTurboVersion return null if no package.json", () => {
    expect(getTurboVersion({}, "./__fixtures__/no-app")).toEqual(null);
    expect(mockConsole.error).toHaveBeenCalledWith(
      "≫  ",
      '"__fixtures__/no-app/package.json" could not be read. turbo-ignore turbo version inference failed'
    );
  });

  it("getTurboVersion return null if invalid JSON", () => {
    expect(getTurboVersion({}, "./__fixtures__/invalid_turbo_json")).toEqual(
      null
    );
  });

  describe("pnpm catalog", () => {
    const fixture = "./__fixtures__/turbo_catalog";

    it("warns on catalog usage", () => {
      getTurboVersion({}, fixture);
      expect(mockConsole.warn).toHaveBeenCalledWith(
        "≫  ",
        "Cannot infer turbo version due to use of `catalog` protocol. Remove `turbo` from your PNPM catalog to ensure correct turbo version is used"
      );
    });

    it("falls back to inferring major from turbo.json", () => {
      expect(getTurboVersion({}, fixture)).toEqual("^2");
    });
  });
});
