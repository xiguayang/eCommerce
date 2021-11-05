## Release 3.0
  - [x] User login/logout security
  - [x] Provide access to special VIP page 
  - [x] Handle Page Refresh
  - [x] Handle Customer by email(refactor)
  - [x] Keep track of order history for registered customers

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


### Handle Customers by Email(refactor)
- Bugs:
  - currently, we perform multiple checkouts with same email address
  - multiple customers with same email address
- Solution:
  - A single customer is asscociated with multiple orders
  - on backend, in our CheckoutServiceImpl
    - Check database if customer already exists based on email
    - if so then using the existing custoemr from database
    - else we have a new customer
- Development Process
  - Remove existing data from db tables
    - truncate commmand removes all rows from a table
      - faster than delete, resets auto_increment back to starting value
      ```sql
      USE `full-stack-ecommerce`;
      -- clean up previous database tables
      -- disable foreign key checks ok
      SET FOREIGN_KEY_CHECKS=0;
      TRUNCATE customer;
      TRUNCATE orders;
      TRUNCATE order_item;
      TRUNCATE address;
      SET FOREIGN_KEY_CHECKS =1;
      ```
  - Modify db schema to only allow unique email address
  ` ALTER TABLE customer ADD UNIQUE (email);`
    - set database constraint, MySQL will throw an error if you attempt to insert duplicate email
  - Add new method to CutsomerRepository
    - Spring Data REST and Spring Data JPA supports 'query methods'
    - Spring will construct a query based on method meaninng
    - [CustomerRepository.java](02-back_end/spring-boot-ecommerce/src/main/java/com/hahagroup/ecommerce/dao/CustomerRepository.java)
    - Customer findByEmail(String theEmail)
      - behaind the scenes, Spring will execute a query similar to :
          - `SELECT * FROM customer c WHERE c.email = theEmail`
          - method returns null if not found 
  - Upadate CheckoutServiceImpl[CheckoutService.Impl](02-back_end/spring-boot-ecommerce/src/main/java/com/hahagroup/ecommerce/service/CheckoutServiceImpl.java)
    - Check if customer already exists..if so then using teh existing customer
    ```java
        public PurchaseResponse placeOrder(Purchase purchase) {
          ...
            //populate customer with order
            Customer customer = purchase.getCustomer();
            //check if this is an existing customer by the given email..
            String theEmail = customer.getEmail();
            Customer customerFromDB = customerRepository.findByEmail(theEmail);
            if(customerFromDB !=null){
                //the customer with theEmail has existed in DB
                customer = customerFromDB;
            }
            customer.add(order);
            //save to the database
            customerRepository.save(customer);
    ```


### Backend Configs Refactoring
#### development process
1. Fix deprecated method for Spreing Data REST
   1. [MyDataRestConfig.java](02-back_end/spring-boot-ecommerce/src/main/java/com/hahagroup/ecommerce/config/MyDataRestConfig.java)
      using CorsRegistry
      `public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {`
2. Configure CORS mapping for Spring Data REST
    - ` cors.addMapping("/api/**").allowedOrigins("http:/localhost:4200");`
    - [application.properties](02-back_end/spring-boot-ecommerce/src/main/resources/application.properties)
        move configuration for 'allowed origins' to application.properties `allowed.origins =http://localhost:4200`
    - access the allowed origins in [MyDataRestConfig.java]
    ```java
        @Value("${allowed.origins}")
        private String[] theAllowedOringins;
            @Override
        public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
            //configure cors mapping
            cors.addMapping("/api/**").allowedOrigins(theAllowedOringins);
    ```
    - Use existing property in [application.properties] `spring.data.rest.base-path' which is also available in the config object
    `cors.addMapping(config.getBasePath()+"/**").allowedOrigins(theAllowedOringins)`
    - Now we can remove @CrossOrigin from JpaRepositories
      remove all : @CrossOrigin("http://localhost:4200")
3. Configure CORS mapping for @RestController (RestController and RestData use different configuration)
    remove `@CrossOrigin("http://localhost:4200")`from RestControllor[CheckoutController.java](02-back_end/spring-boot-ecommerce/src/main/java/com/hahagroup/ecommerce/controller/CheckoutController.java)
    adding [MyAppConfig.java](02-back_end/spring-boot-ecommerce/src/main/java/com/hahagroup/ecommerce/config/MyAppConfig.java)
    ```java
          @Configuration
      public class MyAppConfig implements WebMvcConfigurer {
          @Value("${spring.data.rest.base-path}")
          private String basePath;

          @Value("${allowed.origins}")
          private String[] theAllowedOrigins;

          @Override
          public void addCorsMappings(CorsRegistry cors){
              //set up configure cors mapping
              cors.addMapping(basePath+"/**").allowedOrigins(theAllowedOrigins);
          }
      }
      ```
4. Disable HTTP PATCH method
    also need to disable HTTP PATCH method
    ` HttpMethod[] theUnsupportedActions ={HttpMethod.PUT,HttpMethod.POST,HttpMethod.DELETE, HttpMethod.PATCH};`
5. Modify Spring Data REST Detection Strategy
   - By default, Spring Data REST will expose REST APIs for Spring Data Repository, but we may not want to expose all
     - REST endpoint/api/customers is currently exposed, But we only want to use customer to check email internally
   - Spring Data REST has different detection strategies
     - ALL: EXPSOES ALL Spring Data repositories regardless of their java visiblilty or annotation configuration
     - DEFAULT: Exposes Public Spirng Data Respository or Ones explicitly annotated with @RepositoryRestResource and its exported attribute not set to false
     - VISIBILITY: Exposes only public Spring Data Respository regardless of annotation configuration
     - ANNOTATED: Only exposes Spring Data Respository explicitly annotated with @RepositoryRestResource and its exported attribute not set to false
   - we use  ANNOTATED here [application.properties] `spring.data.rest.detection-strategy= ANNOTATED`



### Order History
#### function overview
1. Allow users to view their previous history
2. Only allowed user logged in/authenticated

#### Development Process - Spring Boot
1. Create OrderRepository REST API
   1. Expose endpoint to search for orders by the customer's email address
    GET /api/orders/search/findByCustomerEmail?email=xxxxx
    Entity Classes relationship: Order --> customer-->has email
    ```java
    @RepositoryRestResource
    public interface OrderRepository extends JpaRepository<Order, Long> {
        Page<Order> findByCustomerEmail(@Param("email")String email, Pageable pageable);
    }
    ```
    Behind the scenes:
    ```SQL
    SELECT * FROM orders
    LEFT OUTER JOIN customer
    ON orders.customer_id = customer.id
    WHERE customer.email =: email
    ```
2. Update configs to make OrderRepository REST API read only[MyDataRestConfig.java](02-back_end/spring-boot-ecommerce/src/main/java/com/hahagroup/ecommerce/config/MyDataRestConfig.java)
`   disableHttpMethods(Order.class, config, theUnsupportedActions);`
3. test on Postman:http://localhost:8080/api/orders/search/findByCustomerEmail?email=happylay@test.com

#### Development Process - Angular
1. Keep track of logged in user's email with web browser storage
   1. Use Browser session storage [LoginStatus.component.ts](03-frontend/anguler-ecommerce/src/app/components/login-status/login-status.component.ts)
    ```ts
      //reference to web browser's session storage(web tag)
      storage: Storage = sessionStorage;
      ...
      getUserDetails(){
        if(this.isAuthenticated){
          //Fetch the logged in user details(user's claims)
          // user full name is exposed as a proterty name
          this.oktaAuthService.getUser().then(res=>{
            this.userFullName=res.name;
            //retrieve the user's email from authentication response
            const theEmail = res.email;
            //now store the email in browser storage
            //key and value
            this.storage.setItem('userEmail', JSON.stringify(theEmail));
          })
    ```
2. Create OrderHistory class ==> Order Entity
    [OrderHistory.ts](03-frontend/anguler-ecommerce/src/app/common/order-history.ts)
    ```ts
    export class OrderHistory {
        id: string;
        orderTrackingNumber: string;
        totalPrice: number;
        totalQuantity: number;
        dateCreated: Date;
    }
    ```
3. Develop OrderHistory service
  `ng generate service services/OrderHistory`[order-history.service.ts](03-frontend/anguler-ecommerce/src/app/services/order-history.service.ts)
  ```ts
   @Injectable({
      providedIn: 'root'
    })
    export class OrderHistoryService {
      private orderUrl = 'http://localhost:8080/api/orders';
      constructor(private httpClient:HttpClient) { }

      getOrderHistory(theEmail: string): Observable<GetResponseOrderHistory>{
        //need to build URL based on customer history
        const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmail?email=${theEmail}`

        return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl);
      }
    }
    interface GetResponseOrderHistory{
      _embedded:{
        orders: OrderHistory[];
      }
    }
  ```
4. Generate order-history component
  `ng generate component components/OrderHistory`[order-history.component.ts](03-frontend/anguler-ecommerce/src/app/components/order-history/order-history.component.ts)
  ```ts
   export class OrderHistoryComponent implements OnInit {
    orderHistoryList: OrderHistory[]=[];
    storage: Storage= sessionStorage;
    //inject OrderHistoryService
    constructor(private orderHistoryService:OrderHistoryService) { }

    ngOnInit(): void {
      this.handleOrderHistory();
    }

    handleOrderHistory(){
      //read the user's email from session storage
      const theEmail = JSON.parse(this.storage.getItem("userEmail"))
      
      //retrieve data from service
      this.orderHistoryService.getOrderHistory(theEmail).subscribe(
        data=>{this.orderHistoryList=data._embedded.orders}
      )
    }
   }
  ```
5. Update template text in HTML page
```html
  <h3>Your Orders</h3>
  <div *ngIf="orderHistoryList.length > 0">
    <table class="table table-bordered">
      <tr>
        <th width="20%">Order Tracking Number</th>
        <th width="10%">Total Price</th>
        <th width="10%">Total Quantity</th>
        <th width="10%">Date</th>
      </tr>
      <tr *ngFor="let tempOrderHistory of orderHistoryList">
        <td>{{ tempOrderHistory.orderTrackingNumber }}</td>
        <td>{{ tempOrderHistory.totalPrice | currency: "USD" }}</td>
        <td>{{ tempOrderHistory.totalQuantity }}</td>
        <td>{{ tempOrderHistory.dateCreated | date: "medium" }}</td> 
        <!-- other date format: short long full... -->
      </tr>
    </table>
  </div>
```
6. Add 'Orders' button to login-status component[login-status.component.html](03-frontend/anguler-ecommerce/src/app/components/login-status/login-status.component.html)
```html
  <button
    *ngIf="isAuthenticated"
    routerLink="/order-history"
    class="security-btn ml-2"
  >
    Orders
  </button>
```
7. Define protected route for order-history component [app.module.ts](03-frontend/anguler-ecommerce/src/app/app.module.ts)
  `{path: 'order-history', component: OrderHistoryComponent, canActivate:[OktaAuthGuard]} `
8. Sort the orders by date(descending order, most recent date first)
   1. backend
    `Page<Order> findByCustomerEmailOrderByDateCreatedDesc(@Param("email")String email, Pageable pageable);`
   2. frontend[order-history.service.ts]
    ` const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${theEmail}``
9. pre-populate user's email address from storage session when check out
  [checkout.component.ts]
  ```ts
  storage:Storage=sessionStorage;
  ...
    //read the user's email from storage session
    const theEmail = JSON.parse(this.storage.getItem('userEmail'));
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
  ...
        email: new FormControl(theEmail, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), EshopValidators.notOnlyWhitespace])
      }),
  ```

#### View Order History (Unsecured REST API for /api/orders)
##### need secure order history backend
  - /api/orders should only avalibale to logged in users
- Development Process - Spring Boot
  1. Add Okta Spring Boot Starter to Maven pom.xml(dependency)
     1. Okta provides a Spring Boot Starter for OAuth 2/ OpenID Connect
     2. Simplifies integration and configuration of Spring Security and Okta
    [pom.xml](02-back_end/spring-boot-ecommerce/pom.xml)
    https://github.com/okta/okta-spring-boot
      ```java
      	<dependencies>
            <dependency>
              <groupId>com.okta.spring</groupId>
              <artifactId>okta-spring-boot-starter</artifactId>
              <version>2.0.1</version>
            </dependency>
      ```
      maven-reload project
  2. Create an App at the Okta Developer website
      create app integration==>OIDC==>web application
      login redirect URIs: http://localhost:8080/login/oauth2/code/okta
      this URI is automatically exposed on our Spring Boot APP.This is provided by the Okta Spring Boot Starter we added the dependency in our pom.xml
      clientId: 
      Client Secret: 
      okta domain:
  3. In Spring Boot app, set application properties
      Spring Boot application use these properties to verify/validate JWT access tokens
      [application.properties](01-starter-files/spring-boot-properties/application.properties)
      ```java
      okta.oauth2.client-id={yourClientId}
      okta.oauth2.client-secret ={yourClientSecret}
      okta.oauth2.issuer=https://{yourClientDomain}/oauth2/default
      ```
      - OAuth2: 
        - Resource Owner(end user)
        - Resource Server(Protected Resource):
          - the app that hosting our protected resources
            - in this case is our Spring Boot app
          - manages security using access tokens(JWT)
          - the access tokens are validated with the 'Authorization Server' Okta
        - Client App(Anguler)
          - Sends the access token as HTTP request header to Resource Server(Spring Boot)
            - Request header: Authorization: Bearer<token>
            - Request body
        - Auhorization Server(Okta)
      - Process:
      Resource Owner --login w/Resource Owner's credentials-->Client App
      Client App ----Send Credentails ---> Authorization Server
                <--- Provide Auth Token --
                ---Request Access token--->
                <-- Provides Access token--
                ----------------------------Send Access token -----------------------> Resource Server
                                      Authorization Server <---Verify/Validate token--
                <------------------Provides access to protected resource--------------


  4. Protect endpoints in Spring Security configuration class
      [SecurityConfiguration.java](02-back_end/spring-boot-ecommerce/src/main/java/com/hahagroup/ecommerce/config/SecurityConfiguration.java)
      - specify: protect the endpoint: only accessible to authenticated users
        **: apply to  this path and all sub-paths recursively
      - Configures OAuth2 Resource Server support
      - Enables JWT-endcoded bearer token support
        - JSON Web Token(JWT)'jot'
      ```java
      @Configuration
      public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
          @Override
          protected void configure(HttpSecurity http) throws Exception {
              //protect endpoint: /api/orders
              //only accessible to authenticated users
              http.authorizeRequests()
                      //apply to  this path and all sub-paths recursively
                      .antMatchers("/api/orders/**")
                      .authenticated()
                      .and()
                      //Configures OAuth2 Resource Server supports
                      .oauth2ResourceServer()
                      // Enables JWT-endcoded bearer token support
                      .jwt();
              //add CORS filters
              http.cors();
          }
      }
      ```

##### need to update Angular app to pass the access token with the HTTP resquest
- Client(Angular) sends the access token as an HTTP request header to Rsource Server(backend Spring Boot)
- Angular Interceptors
  - An interceptor can initercept HTTP requests/responses
  - useful to perform processing on the HTTP  requests/responses
    - My Angular Code <--HTTPClient ------Interceptor(0..MANY)------>REST API
  - will use an interceptor to pass  to access token in HTTP request
    - the interceptor will basically take the request and we'll use that to add the access token
- Development Process
1. Create an interceptor
   1. Develop the iinterceptor as a service [auth-interceptor.service.ts](03-frontend/anguler-ecommerce/src/app/services/auth-interceptor.service.ts)
  ` ng generate service services/AuthInterceptor` 
  ```ts
  export class AuthInterceptorService implements HttpInterceptor {
    //HttpInterceptor is an interface provided by angular
    //inject Okta services in constructor
      constructor(private oktaAuth: OktaAuthService) { }

      //will intercept all outgoing HTTP requests of HttpClient
      intercept(request: HttpRequest<any>, next:HttpHandler):Observable<HttpEvent<any>>{
        return from(this.handleAccess(request,next))
      }
      //returns a promise
      private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
        //only add an access token for secured endpoints
        const securedEndpoints=['http://localhost:8080/api/orders'];
        if(securedEndpoints.some(url=>request.urlWithParams.includes(url))){
          //get access token
          const accessToken = await this.oktaAuth.getAccessToken();
          //getAccessToken is an Async call, adding await to wait the call to finish

          //request is immutable, must clone
          //clone the request and add new header with access token
          request= request.clone({
            setHeaders:{
                 //attention: must have a space after 'Bearer '
              Authorization: 'Bearer '+accessToken
            }
          })
        }
        //Pass the request to the next interceptor in the chain
        return next.handle(request).toPromise();
      }
    }
```
2. Update [app.module.ts](03-frontend/anguler-ecommerce/src/app/app.module.ts) to reference interceptor:
  token for HTTP interceptors,
  register our AuthInterceptorService as an HTTP interceptor
  informs Angular that HTTP_INTERCEPTORS is a token for injecting an array of values
  ```ts
    providers: [ProductService, {provide: OKTA_CONFIG, useValue: oktaConfig},
              {provide:HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi:true}],
  ```
3. Checkout bugs: 403 failed
  Reason: Fails because we are sending checkout request with HTTP POST
          By default, CSRF is enabled CSRF performs checks on POST using Cookies
          Since we are not using cookies for session tracking, CSRF says request is unauthorized
  Solution: disabling CSRF(this technique is commonly used for REST APIs)
  [SecurityConfiguration](02-back_end/spring-boot-ecommerce/src/main/java/com/hahagroup/ecommerce/config/SecurityConfiguration.java)
  ```java
          //disable CSRF since we are not using Cookies for session tracking
        http.csrf().disable();
  ```