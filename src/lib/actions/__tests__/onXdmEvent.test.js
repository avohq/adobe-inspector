const onXdmEvent = require("../onXdmEvent");
const AvoInspector = require("../../AvoInspector");

// Mock AvoInspector
jest.mock("../../AvoInspector", () => {
  return jest.fn().mockImplementation(() => ({
    trackSchemaFromEvent: jest.fn(),
  }));
});

// Mock turbine
global.turbine = {
  getExtensionSettings: jest.fn().mockReturnValue({
    apiKey: "test-api-key",
    environment: "dev",
    appVersion: "1.0.0",
  }),
};

describe("onXdmEvent", () => {
  let mockTrackSchemaFromEvent;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTrackSchemaFromEvent = jest.fn();
    AvoInspector.mockImplementation(() => ({
      trackSchemaFromEvent: mockTrackSchemaFromEvent,
    }));
  });

  describe("XDM data location tests", () => {
    test("should find XDM data in event.detail.xdm", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        event: {
          detail: {
            xdm: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
        })
      );
    });

    test("should fall back to event.detail.xdmData when xdm is not present", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        event: {
          detail: {
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
        })
      );
    });

    test("should fall back to payload.xdmData when neither xdm nor xdmData is present", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        xdmData: {
          eventType: "test.event",
          web: { page: "test" },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
        })
      );
    });
  });

  describe("Tenant path tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Set environment to dev for more logging
      turbine.getExtensionSettings = jest.fn().mockReturnValue({
        apiKey: "test-key",
        environment: "dev",
        appVersion: "1.0.0",
      });
    });

    test("should find tenant properties using tenantPath in xdmData", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.xdmData._tenant",
      };

      const payload = {
        event: {
          detail: {
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
              _tenant: { custom: "value" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          custom: "value",
        })
      );
    });

    test("should find tenant properties using tenantPath in xdm", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.xdm._tenant",
      };

      const payload = {
        event: {
          detail: {
            xdm: {
              eventType: "test.event",
              web: { page: "test" },
              _tenant: { custom: "value" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          custom: "value",
        })
      );
    });

    test("should adapt path from xdm to xdmData when needed", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.xdm._tenant",
      };

      const payload = {
        event: {
          detail: {
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
              _tenant: { custom: "value" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          custom: "value",
        })
      );
    });

    test("should adapt path from xdmData to xdm when needed", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.xdmData._tenant",
      };

      const payload = {
        event: {
          detail: {
            xdm: {
              eventType: "test.event",
              web: { page: "test" },
              _tenant: { custom: "value" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          custom: "value",
        })
      );
    });

    test("should extract tenant properties from event.detail.data._tenant with nested objects", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.data._tenant",
      };

      const payload = {
        event: {
          detail: {
            data: {
              _tenant: {
                object1: { prop1: "value1", prop2: "value2" },
                object2: { prop3: "value3", prop4: "value4" },
              },
            },
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          object1: { prop1: "value1", prop2: "value2" },
          object2: { prop3: "value3", prop4: "value4" },
        })
      );

      // Verify the objects are at the top level, not nested under _tenant
      const calledProps = mockTrackSchemaFromEvent.mock.calls[0][1];
      expect(calledProps._tenant).toBeUndefined();
      expect(calledProps.object1).toEqual({ prop1: "value1", prop2: "value2" });
      expect(calledProps.object2).toEqual({ prop3: "value3", prop4: "value4" });
    });

    test("should handle deeply nested tenant properties", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.data._tenant",
      };

      const payload = {
        event: {
          detail: {
            data: {
              _tenant: {
                level1: {
                  level2: {
                    level3: {
                      value: "deeply nested",
                    },
                  },
                },
              },
            },
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          level1: {
            level2: {
              level3: {
                value: "deeply nested",
              },
            },
          },
        })
      );
    });

    test("should handle arrays in tenant properties", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.data._tenant",
      };

      const payload = {
        event: {
          detail: {
            data: {
              _tenant: {
                items: [
                  { id: 1, name: "item1" },
                  { id: 2, name: "item2" },
                ],
                tags: ["tag1", "tag2", "tag3"],
              },
            },
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          items: [
            { id: 1, name: "item1" },
            { id: 2, name: "item2" },
          ],
          tags: ["tag1", "tag2", "tag3"],
        })
      );
    });

    test("should handle mixed data types in tenant properties", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.data._tenant",
      };

      const payload = {
        event: {
          detail: {
            data: {
              _tenant: {
                string: "text",
                number: 42,
                boolean: true,
                null: null,
                object: { key: "value" },
                array: [1, 2, 3],
              },
            },
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          string: "text",
          number: 42,
          boolean: true,
          null: null,
          object: { key: "value" },
          array: [1, 2, 3],
        })
      );
    });

    test("should handle multiple tenant paths in sequence", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.data._tenant",
      };

      const payload = {
        event: {
          detail: {
            data: {
              _tenant: {
                prop1: "value1",
              },
            },
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      // First call
      onXdmEvent(settings, payload);
      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          prop1: "value1",
        })
      );

      // Second call with different path
      settings.tenantPath = "detail.xdm._tenant";
      // Clear xdmData and set xdm
      delete payload.event.detail.xdmData;
      payload.event.detail.xdm = {
        _tenant: {
          prop2: "value2",
        },
        eventType: "test.event",
        web: { page: "test" },
      };

      onXdmEvent(settings, payload);
      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          prop2: "value2",
        })
      );
    });

    test("should handle edge cases in tenant properties", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.data._tenant",
      };

      const payload = {
        event: {
          detail: {
            data: {
              _tenant: {
                emptyObject: {},
                emptyArray: [],
                specialChars: "!@#$%^&*()",
                unicode: "🌟",
                veryLongString: "a".repeat(1000),
                date: new Date("2024-01-01").toISOString(),
              },
            },
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          emptyObject: {},
          emptyArray: [],
          specialChars: "!@#$%^&*()",
          unicode: "🌟",
          veryLongString: "a".repeat(1000),
          date: new Date("2024-01-01").toISOString(),
        })
      );
    });

    test("should handle missing or malformed tenant data gracefully", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.data._tenant",
      };

      const testCases = [
        {
          name: "missing tenant object",
          payload: {
            event: {
              detail: {
                data: {},
                xdmData: {
                  eventType: "test.event",
                  web: { page: "test" },
                },
              },
            },
          },
        },
        {
          name: "null tenant object",
          payload: {
            event: {
              detail: {
                data: {
                  _tenant: null,
                },
                xdmData: {
                  eventType: "test.event",
                  web: { page: "test" },
                },
              },
            },
          },
        },
        {
          name: "non-object tenant",
          payload: {
            event: {
              detail: {
                data: {
                  _tenant: "not an object",
                },
                xdmData: {
                  eventType: "test.event",
                  web: { page: "test" },
                },
              },
            },
          },
        },
      ];

      testCases.forEach((testCase) => {
        jest.clearAllMocks();
        onXdmEvent(settings, testCase.payload);

        expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
          "test.event",
          expect.objectContaining({
            web: { page: "test" },
          })
        );

        const calledProps = mockTrackSchemaFromEvent.mock.calls[0][1];
        expect(calledProps._tenant).toBeUndefined();
      });
    });

    test("should continue when XDM data is missing but tenant properties exist", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.data._tenant",
      };

      const payload = {
        event: {
          detail: {
            data: {
              _tenant: {
                prop1: "value1",
                prop2: "value2",
              },
            },
            // No xdmData or xdm present
          },
        },
      };

      onXdmEvent(settings, payload);

      // Should still track with just tenant properties
      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        undefined, // No eventType since no XDM data
        expect.objectContaining({
          prop1: "value1",
          prop2: "value2",
        })
      );

      // Verify web field is not present since it's from XDM
      const calledProps = mockTrackSchemaFromEvent.mock.calls[0][1];
      expect(calledProps.web).toBeUndefined();
    });

    test("should continue when tenant properties are missing but XDM data exists", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.data._tenant",
      };

      const payload = {
        event: {
          detail: {
            data: {
              // No _tenant object present
            },
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      // Should still track with just XDM data
      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
        })
      );

      // Verify tenant properties are not present
      const calledProps = mockTrackSchemaFromEvent.mock.calls[0][1];
      expect(calledProps.prop1).toBeUndefined();
      expect(calledProps.prop2).toBeUndefined();
    });

    test("should handle both XDM and tenant data in different locations", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "detail.data._tenant",
      };

      const payload = {
        event: {
          detail: {
            data: {
              _tenant: {
                prop1: "value1",
              },
            },
            xdm: {
              // Note: using xdm instead of xdmData
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      // Should track with both XDM and tenant data
      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          prop1: "value1",
        })
      );
    });

    test("should prefer xdm over xdmData when both are present", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        event: {
          detail: {
            xdm: {
              eventType: "test.event",
              web: { page: "test" },
            },
            xdmData: {
              eventType: "wrong.event",
              web: { page: "wrong" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      // Should use xdm, not xdmData
      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
        })
      );
    });
  });

  describe("Error handling tests", () => {
    test("should handle missing XDM data", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        event: {
          detail: {},
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).not.toHaveBeenCalled();
    });

    test("should handle invalid tenant path", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
        tenantPath: "invalid.path._tenant",
      };

      const payload = {
        event: {
          detail: {
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
              _tenant: { custom: "value" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      // Should fall back to using tenantId
      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          custom: "value",
        })
      );
    });

    test("should handle missing eventType", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        event: {
          detail: {
            xdmData: {
              web: { page: "test" },
              _tenant: { custom: "value" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          web: { page: "test" },
          custom: "value",
        })
      );
    });
  });

  describe("XDM fields filtering tests", () => {
    test("should only include specified XDM fields", () => {
      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        event: {
          detail: {
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
              device: { type: "mobile" },
              _tenant: { custom: "value" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).toHaveBeenCalledWith(
        "test.event",
        expect.objectContaining({
          web: { page: "test" },
          custom: "value",
        })
      );

      const calledProps = mockTrackSchemaFromEvent.mock.calls[0][1];
      expect(calledProps.device).toBeUndefined();
    });
  });

  describe("Validation and error cases", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should handle missing extension settings", () => {
      // Mock turbine to return no extension settings
      turbine.getExtensionSettings = jest.fn().mockReturnValue(null);

      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        event: {
          detail: {
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "[Avo Inspector] Extension settings not found. Please ensure the extension is properly configured."
      );
    });

    test("should handle missing API key", () => {
      // Mock turbine to return settings without API key
      turbine.getExtensionSettings = jest.fn().mockReturnValue({
        environment: "dev",
        appVersion: "1.0.0",
      });

      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        event: {
          detail: {
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "[Avo Inspector] API key not found in extension settings. Please configure the API key in the extension settings."
      );
    });

    test("should handle failed Avo Inspector initialization", () => {
      // Mock turbine to return valid settings
      turbine.getExtensionSettings = jest.fn().mockReturnValue({
        apiKey: "test-key",
        environment: "dev",
        appVersion: "1.0.0",
      });
      // Mock AvoInspector to return invalid instance
      AvoInspector.mockImplementation(() => ({
        // Missing trackSchemaFromEvent function
      }));

      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        event: {
          detail: {
            xdmData: {
              eventType: "test.event",
              web: { page: "test" },
            },
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "[Avo Inspector] Failed to initialize Avo Inspector. Please check your configuration."
      );
    });

    test("should handle missing event data", () => {
      // Mock turbine to return valid settings
      turbine.getExtensionSettings = jest.fn().mockReturnValue({
        apiKey: "test-key",
        environment: "dev",
        appVersion: "1.0.0",
      });

      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        event: {
          detail: {
            // No xdmData or xdm
          },
        },
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        "[Avo Inspector] No event data found to process"
      );
    });

    test("should handle missing event object", () => {
      // Mock turbine to return valid settings
      turbine.getExtensionSettings = jest.fn().mockReturnValue({
        apiKey: "test-key",
        environment: "dev",
        appVersion: "1.0.0",
      });

      const settings = {
        xdmFields: ["web"],
        tenantId: "_tenant",
      };

      const payload = {
        // No event object
      };

      onXdmEvent(settings, payload);

      expect(mockTrackSchemaFromEvent).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        "[Avo Inspector] No event data found to process"
      );
    });
  });
});
