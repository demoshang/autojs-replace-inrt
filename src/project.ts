import bb from 'bluebird';
import {
  copy,
  copyFile,
  move,
  readdir,
  readFile,
  readJSON,
  stat,
  writeFile,
  writeJSON,
} from 'fs-extra';
import { resolve as pathResolve } from 'path';

import { Env } from './environment';

export class Project {
  constructor(private env: Env) {}

  public async replace() {
    await this.cpAssets();
    await this.renameApplicationStr(this.env.inrtProjectDir);
    await this.renameApplicationDir();
    await this.replaceLogo();
    await this.replaceName();
    await this.replaceSplash();
    await this.replaceVersions();
  }

  private async replaceVersions() {
    const { filePath, ...data } = this.env.appVersions;
    const originData = await readJSON(filePath);
    await writeJSON(
      filePath,
      {
        ...originData,
        ...data,
      },
      { spaces: 2 }
    );
  }

  private async cpAssets() {
    await copy(this.env.assetsPath.from, this.env.assetsPath.to);
  }

  private async replaceSplash() {
    if (!this.env.appSplash) {
      return;
    }

    await copyFile(this.env.appSplash.from, this.env.appSplash.to);

    const originContent = await readFile(this.env.appSplash.filePath, { encoding: 'utf8' });

    const content = originContent
      .replace(
        this.env.appSplash.substr,
        `app:srcCompat="@mipmap/gakki"
        tools:srcCompat="@mipmap/${this.env.appSplash.name}"`
      )
      .replace(
        'android:layout_width="match_parent"',
        `xmlns:tools="http://schemas.android.com/tools"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"`
      );

    await writeFile(this.env.appSplash.filePath, content);
  }

  private async replaceName() {
    const originContent = await readFile(this.env.androidManifest.filePath, { encoding: 'utf8' });

    const content = originContent.replace(
      this.env.androidManifest.appName,
      `android:label="${this.env.appName}"`
    );

    await writeFile(this.env.androidManifest.filePath, content);
  }

  private async replaceLogo() {
    if (!this.env.appLogo) {
      return;
    }

    await copyFile(this.env.appLogo.from, this.env.appLogo.to);

    const originContent = await readFile(this.env.androidManifest.filePath, { encoding: 'utf8' });

    const content = originContent.replace(
      this.env.androidManifest.appLogo,
      `android:icon="@mipmap/${this.env.appLogo.name}"`
    );

    await writeFile(this.env.androidManifest.filePath, content);
  }

  private async replaceApplicationId(content: string): Promise<string> {
    if (!content.includes(this.env.defaultApplicationId.str)) {
      return content;
    }

    return content.replace(this.env.defaultApplicationId.regexp, this.env.applicationId);
  }

  private async replaceAuthorities(content: string) {
    if (!content.includes(this.env.defaultAuthorities)) {
      return content;
    }

    return content.replace(this.env.defaultAuthorities, `${this.env.applicationId}.provider`);
  }

  private async renameApplicationDir() {
    const dir = pathResolve(
      this.env.defaultApplicationPath.base,
      this.env.applicationId.split('.').join('/')
    );

    await move(this.env.defaultApplicationPath.full, dir);
  }

  private async renameApplicationStr(dir: string) {
    const files = await readdir(dir);

    await bb
      .map(files, async (name) => {
        const p = pathResolve(dir, name);
        const stats = await stat(p);

        return {
          name,
          path: p,
          stats,
        };
      })
      .map(async ({ stats, path }) => {
        if (stats.isFile()) {
          const originContent = await readFile(path, { encoding: 'utf8' });
          let content = await this.replaceApplicationId(originContent);
          content = await this.replaceAuthorities(content);

          if (content !== originContent) {
            await writeFile(path, content);
          }
        } else if (stats.isDirectory()) {
          await this.renameApplicationStr(path);
        }
      });
  }
}
