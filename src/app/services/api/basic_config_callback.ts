import {BasicConfig} from "./basic_config";

export interface BasicConfigCallback {
  basicConfig(basicConfig: BasicConfig);
  error(error: string);
}
