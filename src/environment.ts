import { readJSON } from 'fs-extra';
import { resolve as pathResolve, parse } from 'path';

export interface Env {
  applicationId: string;
  appLogo?: {
    name: string;
    from: string;
    to: string;
  };
  appSplash?: {
    name: string;
    from: string;
    to: string;
    filePath: string;
    substr: string;
  };
  appName: string;
  appVersions: {
    filePath: string;
    appVersionCode: number;
    appVersionName: string;
  };
  inrtProjectDir: string;

  androidManifest: {
    filePath: string;
    appLogo: string;
    appName: string;
  };
  defaultApplicationId: {
    str: string;
    regexp: RegExp;
  };
  defaultApplicationPath: {
    full: string;
    base: string;
    application: string;
  };
  defaultAuthorities: string;
  assetsPath: {
    from: string;
    to: string;
  };
}

async function getEnv(autojsProjectDir: string, jsDir: string): Promise<Env> {
  let project = await readJSON(pathResolve(jsDir, 'project.json'));
  project = {
    name: '未命名',
    logo: '',
    splash: '',
    ...project,
  };

  const appLogoPath = pathResolve(jsDir, project.logo);
  const appLogoParse = parse(appLogoPath);

  const appSplashPath = pathResolve(jsDir, project.splash);
  const appSplashParse = parse(appSplashPath);

  return {
    appVersions: {
      appVersionCode: project.versionCode,
      appVersionName: project.versionName,
      filePath: pathResolve(autojsProjectDir, 'project-versions.json'),
    },
    applicationId: project.packageName,
    appLogo: project.logo && {
      name: appLogoParse.name,
      from: appLogoPath,
      to: pathResolve(
        autojsProjectDir,
        `inrt/src/main/res/mipmap/${appLogoParse.name}${appLogoParse.ext}`
      ),
    },
    appSplash: project.splash && {
      name: appSplashParse.name,
      from: appSplashPath,
      to: pathResolve(
        autojsProjectDir,
        `inrt/src/main/res/mipmap/${appSplashParse.name}${appSplashParse.ext}`
      ),

      filePath: pathResolve(autojsProjectDir, 'inrt/src/main/res/layout/activity_splash.xml'),
      substr: 'android:src="@drawable/autojs_material"',
    },
    appName: project.name,
    inrtProjectDir: autojsProjectDir,
    defaultApplicationId: {
      str: 'com.shang.autojs.jd.nianshou',
      regexp: /com\.stardust\.auojs\.inrt/gm,
    },
    defaultApplicationPath: {
      full: pathResolve(autojsProjectDir, 'inrt/src/main/java/com/stardust/auojs/inrt'),
      base: pathResolve(autojsProjectDir, 'inrt/src/main/java'),
      application: 'com/stardust/auojs/inrt',
    },
    defaultAuthorities: 'com.shang.autojs.jd.nianshou.provider',
    assetsPath: {
      from: jsDir,
      to: pathResolve(autojsProjectDir, 'inrt/src/main/assets/project'),
    },
    androidManifest: {
      filePath: pathResolve(autojsProjectDir, 'inrt/src/main/AndroidManifest.xml'),
      appLogo: 'android:icon="@mipmap/ic_launcher"',
      appName: 'android:label="inrt"',
    },
  };
}

export { getEnv };
