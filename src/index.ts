/* eslint-disable no-console */
import { getEnv } from './environment';
import { Project } from './project';

(async () => {
  const env = await getEnv(process.argv[2], process.argv[3]);
  const project = new Project(env);

  await project.replace();
})()
  .then(() => {
    console.info('=====done====');
  })
  .catch(console.warn);
