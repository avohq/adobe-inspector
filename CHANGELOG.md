### [1.2.2] 2025-06-16

#### [BUGFIX]

- [Critical] Fixed a bug where enivornment variable was used before initialization, causing a crash.

- Added a tenantPath configuration to have the user point the integration to the tenant object if its not in the xdm object
  - defaults to xdm.<\_tenantId>
- Added a eventNamePath configuration to have the user point the integration to the eventName field if its not xdm.eventType
  - defaults to xdm.eventType

### [1.2.0] 2025-06-06

Added new integration option to listen for XDM events send from Adobe Web SDK Extension!
Add a listener in "onBeforeSend" in Adobe WebSDK to forward to the Inspector and have Avo Inspector validate the XDM Schema!

- [ADDED] New Event Listener XDM Event to Inspector Listener
- [ADDED] New Action Handle XDM Event

### [1.1.2] - 2025-03-11

### Bug Fixes

- Fixed a bug where action configration changes were not being reflected in the extension.

## [1.1.0] - 2025-03-04

### Breaking Changes

- Removed Event Configuration from the Extension.

### Added

- Action now listens to pushData events from Adobe Client Data Layer extension.
- Action now listens to pushData events from Google Data Layer extension.
