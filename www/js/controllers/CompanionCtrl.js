ParalignAppControllers.controller('CompanionCtrl', ['SettingsService', CompanionCtrl]);
function CompanionCtrl(SettingsService) {
  SettingsService.refreshAppSettings();
}