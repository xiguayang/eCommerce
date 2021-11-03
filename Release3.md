## Release 3.0
  - [x] User login/logout security
  - [x] Provide access to special VIP page 
  - [] Keep track of order history for registered customers

### Terms:
- Authentication: The process of validating whether a user/app is who they claim to be
- Authorization: Process of determing the actions a user/app can perform
- OAuth 2: framework that enables applications to have limited access to a resource on behalf of a resoucers owner
- OpenID Connect(OIDC): Identity layer on top of OAuth 2
- JSON Web Tokens(JWT): Open Standard that defines self-contained way of describing tokens
  - Header: signing algorithm and type of token
  - Payload: contains content for user data
  - Signature: guarantee integrity of the token
  
### Okat.com which provides a cloud based authoritation server and platform
#### Okta <--->Angular
  - Sign-in widget
  - Authentitaction
  - Authroization
  - User Management
#### Development Process - Angular
1. Create a free developer account at okta.com
2. Add OpenID connect client app in Okta
3. Set up app configuration for OpenID connect
   1. need the clientId and issuer
   2. `ng generate interface config/MyAppConfig`[my-app-config.ts](03-frontend/anguler-ecommerce/src/app/config/my-app-config.ts)
        ```JAVASCRIPT
        export default{
            oidc:{
                clientId:'',
                issuer:'https://{domain}/oaut2/default',
                redirectUri:'http://localhost:4200/login/callback',
                scopes:['openid','profile','email']
            }
        }
        ```
4. Intall Okta SDK dependencies
   1. Okta Sign-In Widget(A JS library for app login)
      1. npm install @okta/okta-signin-widget
   2. Okta Angular SDK(provides integration with angular Router for authentication and authorization)
      1. npm install @okta/okta-angular@3.0.1
   3. npm audit fix

5. Integrate Okta Sign-in widget 
  [angular.json](03-frontend/anguler-ecommerce/angular.json)
    Add reference for okta sign in css
    ```
        "styles": [
              "src/styles.css",
              "node_modules/bootstrap/dist/css/bootstrap.min.css",
              "node_modules/@fortawesome/fontawesome-free/css/all.min.css",
              "node_modules/@okta/okta-signin-widget/dist/css/okta-sign-in.min.css"
            ],
    ```

    `ng generate component components/login`
    [login.component.ts](03-frontend/anguler-ecommerce/src/app/components/login/login.component.ts)
    ```js
        oktaSignIn: any;
        constructor(private oktaAuthService: OktaAuthService) { 
          this.oktaSignIn = new OktaSignIn({
            //logo: 'assets/images/logo.png',
            baseUrl: myAppConfig.oidc.issuer.split('./oauth2')[0],
            clientId: myAppConfig.oidc.clientId,
            redirectUrl: myAppConfig.oidc.redirectUri,
            authParams:{
              pkce: true,
              issuer: myAppConfig.oidc.issuer,
              scopes: myAppConfig.oidc.scopes
            }
          })
        }
        ngOnInit(): void {
          this.oktaSignIn.remove();
          //render elements with given id
          this.oktaSignIn.renderEl({
            el: '#okta-sign-in-widget'},//this name should be same as div tag id in login.component.html
            (response)=>{
              if(response.status ==='SUCCESS'){
                this.oktaAuthService.signInWithRedirect();
              }
            },
          (error)=>{
            throw error;
          })
        }
    ```
    - Authorization Code Flow with PKCE(proof key for code exchange)
      - recommended approach for controllling access between app and auth server
      - protects agianse authoriaztion code interception attacks
      - iintroduces concept of dynamic secrets
      - implemented with a code verifier, code challege and method
6. Develop login status component for login/logout buttons
    `ng generate component components/LoginStatus`
     [login-status.component.ts](03-frontend/anguler-ecommerce/src/app/components/login-status/login-status.component.ts)
     ```js
      export class LoginStatusComponent implements OnInit {

        isAuthenticated: boolean = false;
        userFullName: String;

        constructor(private oktaAuthService: OktaAuthService) { }

        ngOnInit(): void {
          //Subscribe to authentication state changes
          this.oktaAuthService.$authenticationState.subscribe(
            (result)=>{
              this.isAuthenticated = result; 
              this.getUserDetails();})
        }
        getUserDetails(){
          if(this.isAuthenticated){
            //Fetch the logged in user details(user's claims)
            // user full name is exposed as a proterty name
            this.oktaAuthService.getUser().then(res=>{
              this.userFullName=res.name;
            })
          }
        }

        logout(){
          //terminates the session with Okta and removes current tokens.
          this.oktaAuthService.signOut();
        }

      }
      ```
    [login-status.component.html](03-frontend/anguler-ecommerce/src/app/components/login-status/login-status.component.html)
    ```html
    <div class="login-status-header">
      <div *ngIf="isAuthenticated && userFullName" class="login-status-user-info">
        Welcome back {{userFullName}
      </div>
      <button *ngIf="!isAuthenticated" routerLink="/login" class="security-btn">
        Login
      </button>
      <button *ngIf="isAuthenticated" (click)="logout()" class="security-btn">
        Logout
      </button>
    </div>
    ```
    Add the login status component to header section[app.component.html]()
    `  <app-login-status></app-login-status>`
7. Update app moduel configs to connect routes
    Once the user is authenticated, they are redirected to your app
    Normally you need to parse the response and store the OAuth+OIDC tokens
    The OktaCallbackComponent does this for you
    ```js
    import {
        OKTA_CONFIG,
        OktaAuthModule,
        OktaCallbackComponent
      } from '@okta/okta-angular';
      import myAppConfig from './config/my-app-config';
      const oktaConfig = Object.assign({
        onAuthRequired: (injector)=>{
          const router = injector.get(Router);

          //redirect the urser to your custom login page
          router.navigate(['/login'])
        } 
      }, myAppConfig.oidc);
      const routes: Routes=[
        {path:'login/callback', component:OktaCallbackComponent},
        {path:'login', component:LoginComponent},
        ...

        mports: [
          RouterModule.forRoot(routes),
          BrowserModule,
          HttpClientModule,
          NgbModule,
          ReactiveFormsModule,
          *OktaAuthModule*
        ],
        *providers: [ProductService, {provide: OKTA_CONFIG, useValue: oktaConfig}]*,
        bootstrap: [AppComponent]
      })
      ```

#### User Registration Process 
- email activation
  - Okta will send the user an email
  - can make it mandatory(production) or optional(dev) 
  1. Enable User Registration in  Okta Dashboard: enable self-registration
  2. Configure code in login component

### VIP member Access
- provide access to special member page only for authenticated users
  - add protected route: http://localhost:4200/members
  - clicking member button redirect to a special member page

- Angular Route Guardsprevents users from accessing a part of an app without authorization
  - common route guard interface is : CanActivate
  - can provide a custom implementation four a route guard interface
  - return true if user can access, false otherwise
   
- Okta provides a route guard implementation: OktaAuthGuard
  - Link member button to a route
  - route guard configuration in the specific route 
    - if authenticated, give access to route, else, send to login page
  `{path: 'members', component: MembersPageComponent, canActivate:[OktaAuthGuard]} `

#### Development Process --- VIP member Access 
1. Generate members-page component `ng generate component  components/MembersPage`
2. Update Template text in HTML page
3. Add 'Member' button to login-status component
    `  <button routerLink="/members" class="security_btn">Member</button>`
4. Define protected route for members-page component
    ```ts
    //inject
    const oktaConfig = Object.assign({
        onAuthRequired: (oktaAuth, injector)=>{
    ...
    }})
    const routes: Routes=[
      {path: 'members', component: MembersPageComponent, canActivate:[OktaAuthGuard]} ,
    ```


### Fix bug when refreshing page
- Bugs
  -  refresh page, lose products in the cart
  -  products lost after login 
- Solotion: keep track of the cart products using client side browser web storage
   -  HTML5 introduced the Web Storage API
      -  store data in the browser using key/value pairs
      -  similar to cookies but provides a more intuitive API
      -  require modern web browser support HTML5
   - 2 types Web Storage API 
     - Session Storage: stored in web browswer's memory
       - data is never sent to server(not HttpSession), web browser client-side session
       - each web browser tab is its own session, data not shared between web browser tabs
       - when tab is closed, data is no longer avaliable
     - Local Storage: stored on client side computer
       - stores data locally on client web browser computer
       - data ss avaliable to tabs of the same web browser for same origin(protocol+hostname+port)
         - app must read data again, normally with a browser refresh
       - Data persists even if the web browser is closed(no expiration)
   - Web Storage API, based on key and value
     - data is scoped to the page origin
       - store item: storage.setItem(key,value): void
       - retrieve item: storage.getItem(key): string
       - removeItem(key): void
       - clear(): void
 - Development Process
  1. Update CartService to read data from session storage[cart.service.ts](03-frontend/anguler-ecommerce/src/app/services/cart.service.ts)
    ```ts
    storage: Storage = sessionStorage;
      constructor() { 
    //read data from storage
    //JSON.parse(): read JSON string and converts to object
    let data = JSON.parse(this.storage.getItem('cartItems'));
    if(data!=null){
      this.cartItems=data;
      //compute the totals based on data that is read from storage
      this.computeCartTotals()
    }
  }
    ```
  2. Add new method in CardService: persistCartItems()
  ```ts
    //JSON.stringify(...): convert object to JSON string
    persistCartItems(){
      this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
    }
  ```
  3. Modify computeCartTotals() to call new method: persistCartItems()
   ```ts
     computeCartTotals() {
        ...
      //persist cart data
      this.persistCartItems()}
  ```
  ==> using localStorage instead of sessionStorage: closing tab doesent lose data
  `storage: Storage=localStorage; //data is persisted and survives brwoser restarts`
  data is not encrypted; from inspect/application/storage can check to review the storage