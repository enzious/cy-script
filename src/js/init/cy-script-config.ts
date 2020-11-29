interface Window {
  cyScriptConfigs: CyScriptConfigs;
}

declare var cyScriptConfigs: CyScriptConfigs;
 
class CyScriptConfigs {
  configs: Map<string, CyScriptConfig> = new Map();
  config: CyScriptConfig;

  addConfig(roomId: string, config: CyScriptConfig) {
    this.configs.set(roomId, config);
  }

  setConfig(roomId: string) {
    this.config = this.configs.get(roomId);
  }
}

interface RoomInfo {
  roomId: string | null;
  roomTitle?: string | null;
  headerLogo?: string | null;
}

interface CyScriptConfig {
  roomInfo: RoomInfo;
  otherRooms?: string[];
}

window.cyScriptConfigs = new CyScriptConfigs();