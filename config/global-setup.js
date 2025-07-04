/**
* External dependencies
*/
import { request } from '@playwright/test';
// import type { FullConfig } from '@playwright/test';


/**
* WordPress dependencies
*/
import { RequestUtils } from '@wordpress/e2e-test-utils-playwright';


async function globalSetup( config ) {
   const { storageState, baseURL, userAgent } = config.projects[ 0 ].use;


   console.log('config :'+ config.projects[0].use.userAgent);
   const storageStatePath =
       typeof storageState === 'string' ? storageState : undefined;


   const requestContext = await request.newContext( {
       baseURL,
       userAgent,
   } );


   const requestUtils = new RequestUtils( requestContext, {
       storageStatePath,
   } );


   // Authenticate and save the storageState to disk.
   await requestUtils.setupRest();


   await requestContext.dispose();
}


export default globalSetup;