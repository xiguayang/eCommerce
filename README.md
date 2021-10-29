# eCommerce
# Release 2.0

- [x] Online Shop Template Integration
- [x] Search for products by category
  - [x] hard code category
  - [x] dynamic read categories form database
- [x] Search for products by text box 
- [x] Master/Detail view of products
- [x] Pagination support for products
- [x] Add products to shopping cart(CRUD)
- [ ] Shopping cart check out

## Online Shop Template Integration
*Wireframes*: 
- Show a list of products in grid
- Left Navigation product category
- top search product by text box
- have pagination
- Shopping cart right top

Wireframes to Web Template(.html and .css)
==>integrate the HTML template with our Angular *.component.html files

### Process:
1. Install Bootstrap CSS style locally using npm
`npm install bootstrap`
`npm install @fortawesome/fontawesome-free`
2. Add local custom CSS styles to Angular [src/styles.css]()
    - adding style dependencies in [angular.json]() and restart
        ```
            "styles": [
              "src/styles.css",
              "node_modules/bootstrap/dist/css/bootstrap.min.css",
              "node_modules/@fortawesome/fontawesome-free/css/all.min.css"
            ],   
        ```    
    - adding styles to [src/styles.css]()(from starter files)
3. Integrate template files into Angular app
    - adding sidebar, header and footer in [app.component.html]()
    - adding grid product showing list in [product-list-grid.component.html]()
    ```html 
        <div class="main-content">
            <div class="section-content section-content-p30">
                <div class="container-fluid">
                    <div class="row">
                        <div *ngFor="let tempProduct of products" class="col-md-3">
                            <div class="product-box">
                                <img src="{{ tempProduct.imageUrl }}" class="img-responsive" />
                                 <h1>{{ tempProduct.name }}</h1>
                                <div class="price">
                                    {{ tempProduct.unitPrice | currency: "USD" }}
                                </div>
                                <a href="#" class="primary-btn">Add to cart</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ```
   - and change product-list.component.ts templateUrl to the new html
    ` templateUrl: './product-list-grid.component.html',`
4. Add support for icons and logos
5. Enhance our application with product images
   - using new scripts for database to enter new 100 products
   - moving images for books into assets/images/products
   - **By default, Spring Data REST only returns the first page of 20 items** ==>[product.service.ts]()
    `private baseUrl="http://localhost:8080/api/products?size=100";`
[Questions Store images in DB or file system?](https://stackoverflow.com/questions/3748/storing-images-in-db-yea-or-nay)




## Search for products by category
show products based on the category selected from sidebar menu

### Angular Routing
- you can add links in your app
- the links will route to other components in your app
- Angular routing will handle updating a view of your app
==>it only updates a section of page not reload entire page

### Key Components
- **Router**: Main routing service. Enables navigation between views based on user actions
- **Route**: Maps a URL path to a component
- **RouterOutlet**: Acts as a placeholder. Renders the desired component based on route.
- **RouterLink**: Link to specific routes in your application
- **ActivatedRoute**: The current active route that loaded the component. Useful for accessing route parameters.

### Development Process
1. Define routes
2. Configure Router based on our routes
3. Define Router Outlet
4. Set up Router Links to pass category id param
5. Enhance ProductListComponent to read category id param
6. Modify Spring Boot app - REST Repository needs new method
7. Update Angular Service to call new URL on Spring Boot app
/?category=""

#### 1. Define Routes
[app.module.ts]()
`const routes: Routes=[{},{},....]`
```javascript
import {Routes, RouterModule} from '@angular/router';
const routes: Routes=[
  {path: 'category/:id', component:ProductListComponent},
  {path: 'category', component:ProductListComponent},
  {path: 'products', component:ProductListComponent},
  {path: '', redirectTo:'/products', pathMatch:'full'},
  {path: '**', redirectTo:'/products', pathMatch:'full'},
];
```
- A route has a path and a reference to a component
- when user selects the link for the route path
  - create a new instance of component when the path is matched
the path has no leading slashes /
`{path:"products", component: ProductListComponent}`
  - Add route to show products for a given category id
    - category id parameter
`{path: "category/:id", component: ProductListComponent}`
  - Add more routes to handle for other cases
    - no category id given, internally the component will use default category id
    - path: ''   ==>no path given, redirect to :'/products' (exception to rule about no leading slashes)
    - pathMatch: 'full'   ==> match on this exactly. default option is 'prefix' match if path starts with a given value
    - path: '**'  ==>generic wildcard. it will match on anything that didn't match above routes
  - Order of routes is important. First match wins! Start from most specific to generic
  - Can also add a custom PageNotFoundComponent ... for 404s as PageNotFoundComponent(defined by self)
#### 2. Configure Router based on our routes in application module
[app.module.ts]()
```javascript
imports:[
    RouterModule.forRoot(routes)
]
```
#### 3. Define the Router Outlet
- acts as a placeholder
- renders the desired component based on route
  - update [app.component.html]() to use Router Outlet
`<router-outlet></router-outlet>`
#### 4. Set up Router Links to pass category id param
- in HTML page, set up links to our route
- Pass category id as a parameter    
`<a routerLink = "/category/1" routerLinkActive="active-link">Books</a>`
we could also add custom CSS style for .active-link{} in [styles.css]()
==>*make dynamic read category info from REST API*

#### 5. Enhance ProductListComponent to read category id param
[product-list.component.ts]()
```javascript
import { ActivatedRoute } from '@angular/router';
export class ProductListComponent implements OnInit {
  products: Product[];
  currentCategoryId: number;
  //inject ActivatedRoute
  constructor(private productService: ProductService,
              private route:ActivatedRoute 
              ) { }
  ngOnInit(){
      //using route.paramMap.subscribe
    this.route.paramMap.subscribe(()=>{
      this.listProducts();
    }) 
  }
  listProducts(){
    //check if "id" parameter is available
    const hasCatogryId: boolean=this.route.snapshot.paramMap.has('id');
    if(hasCatogryId){
      //get the 'id' param string, convert string to number using '+'
      this.currentCategoryId=+this.route.snapshot.paramMap.get('id');
    }else{
      //not cateogy id available, default to category id 1
      this.currentCategoryId=1;
    }
    //passing id into getProductList service method, need to change the method
    this.productService.getProductList(this.currentCategoryId).subscribe(
      data =>{
        this.products = data;
      }
    )
  }
}
```
- route: use the active route
- snapshot: state of route at this given moment in time
- paramMap: map of all the route parameters
- get('id'): read the id parameter  from path :id
- parameter value is returned as string==>using '+' to convert to number
- now we need to pass categoryId into getProductList method==>modify[product.service.ts]()

#### 6. Modify Spring Boot app - REST Repository needs new method
currently, Spring Boot returns products regardless of category
==>modify to only return products for a given category id
- Spring Data REST and JPA supports 'query method'
- Sprign will construct a query based on method naming covention
- Methods starting with: **findBy, readBy, queryBy, etc..**
[ProductRepository.java]()
  ```java
  public interface ProductRepository extends JpaRepository<Product,Long>{
      Page<Product> findByCategoryId(
          @RequestParam("id") Long id, Pageable pageable);
      )
  }
  ```
    - findByCategoryId: query method
    - @RequestParam("id")  use this parameter value
    - Behind the scenes, Spring will execute a query similar to
        `SELECT * FROM product WHERE category_id=?`
      - *More on Query Methods* using @Query("select...") annotation. [Spring Data Reference Manual]()
    - Page and Pageable provides support for pagination 
      - **Page**** is a sublist of a list of objects(has info as *totalElements, totalPages, currentPosition etc*)
      - **Pageable** represents pagination info(has info as *pageNumber, pageSize, previous, next etc*)
    - Spring Data REST automaically expose endpoints for query method
      - Exposes endpoint: /search/queryMethodName
        - http://localhost:8080/api/products/search/findByCategoryId?id=1

#### 7. Update Angular Service to call new URL on Spring Boot app
[product.service.ts]()
```javascript
  private baseUrl="http://localhost:8080/api/products";
  //inject HttpClient
  constructor(private httpClient: HttpClient) { }
  getProductList(theCategoryId: number): Observable<Product[]>{
    //need to build URL based on cateogy id
    const searchUrl=`${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
    return this.httpClient.get<GetResponse>(searchUrl).pipe(
      map(response=>response._embedded.products)
    );
  }
```

## Search for products by category Dynamic get categories
### Development Process
  1. Midify Spring Boot app - Expose entity ids
  2. Create a class: ProductCategory
  3. Create new component for menu
  4. Enhance menu component to read data from product service
  5. Update product service to call URL on Spring Boot app
  6. In HTML, relace hard-coded links with menu component

### 1. Midify Spring Boot app - Expose entity ids
- By default, Spring Data REST does not expose entity id, but we need IDs for a few user cases
  - in productCategory level no entity id but its is embedded in HATEOS links(no easy access, require parsing URL string) http://localhost:8080/api/product-category
- ==>we need Entity id at the productCategory level (with categoryName) for easy access
- Update Spring Data REST config to expose entity ids [MyDataRestConfig.java](02-back_end/spring-boot-ecommerce/src/main/java/com/hahagroup/ecommerce/config/MyDataRestConfig.java)
  - expose entity ids
    - 1. gets a list of all entity classes from entity manager
    - 2. create an array of the entity types
    - 3. get the entity types for the entiteis
    - 4. expose the entity ids for thye array of entity/domain types
    using constructor injection to inject *autowired JPA entity manager* @Autowired
    override *configureRepositoryRestConfiguration*, call an internal helper method *exposeIds(config)*
    in *exposeIds(config)*, Step 1 - 4
    ```java
    @Configuration
    public class MyDataRestConfig implements RepositoryRestConfigurer {
        //autowire JPA entity manager
        private EntityManager entityManager;
        @Autowired
        public MyDataRestConfig(EntityManager theEntityManager){
            entityManager=theEntityManager;
        }
        @Override
         public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
            ...
            // call an internal helper method
            exposeIds(config);
        }
        private void exposeIds(RepositoryRestConfiguration config) {
        //expose entity ids
            // - get a list of all entity classes from the entity manager
            Set<EntityType<?>> entities= entityManager.getMetamodel().getEntities();
            // - create an array of the entity types
             List<Class> entityClasses = new ArrayList<>();
            // - get the entity types for the entities
            for (EntityType tempEntityTpe: entities){
                entityClasses.add(tempEntityTpe.getJavaType());
            }
            // - expose the entity ids for the array of entity/domain types
            Class[] domainTypes = entityClasses.toArray(new Class[0]);
            config.exposeIdsFor(domainTypes);
        }
    }
    ```

### 2. Create a class: ProductCategory in Angular front-end
  `ng generate class common/product-category`
  [product-category.ts](03-frontend/anguler-ecommerce/src/app/common/product-category.ts)
  ```javascript
  export class ProductCategory {
      id:number;
      categoryName:string;
  }
```
### 3. Create new component for menu
`ng generate component components/product-category-menu`

### 4. Enhance menu component to read data from product service
  [product-category-menu.component.ts](03-frontend/anguler-ecommerce/src/app/components/product-category-menu/product-category-menu.component.ts)
  ```javascript
    productCategories: ProductCategory[];
    constructor(private productService: ProductService) { }
    ngOnInit() {
      this.listProductCategories();
    }
    listProductCategories(){
      //update productService file to add getProductCategories()
      this.productService.getProductCategories().subscribe(
        data=>{
          console.log(`Product Cateogories=` + JSON.stringify(data));
          this.productCategories=data;
        }
      )
    }
```

### 5. Upadate product service  to call URL on Spring Boot app
  [product.service.ts](03-frontend/anguler-ecommerce/src/app/services/product.service.ts)
  ```javascript
  export class ProductService {
      //define category url
    private categoryUrl="http://localhost:8080/api/product-category";
  ...
    getProductCategories(): Observable<ProductCategory[]>{
        //Call REST API, returns an observable
      return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
        map(response =>response._embedded.productCategory)
        //Map the JSON datat from Spring Data REST to ProductCategory array
      );
    }
  }
  //unwaps the JSON from Spring Data REST _embedded entry
  interface GetResponseProductCategory{
    _embedded:{
      productCategory: ProductCategory[];
    }
  }
  ```
### 6. In HTML, relace hard-coded links with menu component
  [app.component.html](03-frontend/anguler-ecommerce/src/app/app.component.html)
  `<app-product-category-menu></app-product-category-menu>`
  [product-category-menu.component.html](03-frontend/anguler-ecommerce/src/app/components/product-category-menu/product-category-menu.component.html)
  ``` html
  <!-- MENU SIDEBAR -->
  <div class="menu-sidebar-content js-scrollbar1">
    <nav class="navbar-sidebar">
      <ul class="list-unstyled navbar-list">
        <li **ngFor="let temProductCategory of productCategories">
          <a
            routerLink="/category/{{ temProductCategory.id }}"
            routerLinkActive="active-link"
            >{{ temProductCategory.categoryName }}</a
          >
        </li>
      </ul>
    </nav>
  </div>
  ```
  ### How to display Category Name in Product List Grid Component?
  1. Update route and add parameter
     [app.modlue.ts]()
     `{path: 'category/:id/:name', component: ProductListComponent},`
  2. Update routerLink to include the category name
    [product-category-menu.component.html]()
    `<a routerLink="/category/{{ tempProductCategory.id }}/{{ tempProductCategory.categoryName }}" routerLinkActive="active-link">`
  3. Update component to read the category name
    [product-list.component.ts]()
    ```javascript
     currentCategoryName: string;
     listProducts() {
      ...
        if (hasCategoryId) {
        // get the "id" param string. convert string to a number using the "+" symbol
        this.currentCategoryId = +this.route.snapshot.paramMap.get('id');
        // get the "name" param string
        this.currentCategoryName = this.route.snapshot.paramMap.get('name');
        }
        else {
          // not category id available ... default to category id 1
          this.currentCategoryId = 1;
          this.currentCategoryName = 'Books';
      }
    ```
  4. Update the list-grid HTML file to bind to category name
     [product-list-grid.component.html]()
      `<h4>Category: {{ currentCategoryName }}</h4>   <hr />`


## Search for products by text box 
### Development Process
   1. Modify Spring Boot App -- Add a new search method
   2. Create new component for search
   3. Add new Angular route for searching
   4. Update SearchComponent to send data to search route
   5. Enhance ProductListComponent to search for products with ProductService
   6. Update ProductService to call URL on Spring Boot app

### 1. Modify Spring Boot App -- Add a new search method
 - Spring Data REST and JPA supports "query"
 - Spring will construct a query based on method naming conventions
  [ProductRepository.java](02-back_end/spring-boot-ecommerce/src/main/java/com/hahagroup/ecommerce/dao/ProductRepository.java)
   http://localhost:8080/api/products/search/findByNameContaining?name=Python
`Page<Product> findByNameContaining(@RequestParam("name")String name, Pageable pageable);`
"Containing"... similar to SQL "LIKE"
Behind the scenes, Spring will execute a query similar to this:
```SQL
SELECT * FROM Product p
WHERE
p.name LIKE CONCAT('%', :name, '%')
```
### 2. Create new component for search
- `ng generate component components/search `

### 3. Add new Angular route for searching
[app.module.ts](03-frontend/anguler-ecommerce/src/app/app.module.ts)
add path into route
```javascript
const routes: Routes=[
  {path: 'category/:id/:name', component:ProductListComponent},
  {path: 'search/:keyword', component:ProductListComponent},
```
### 4. Update SearchComponent to send data to search route
#### Steps:
  1. User enters search text
  2. Clicks Search button
  3. SearchComponent hs a click handler method
  4. Read Search text
  5. Route the data to the 'search' route
  6. Handled by the ProductListComponent
[search.component.html](03-frontend/anguler-ecommerce/src/app/components/search/search.component.html)
```HTML
<div class="form-header">
  <input
    #myInput
    type="text"
    placeholder="Search for products ..."
    class="au-input au-input -xl"
    (keyup.enter)="doSearch(myInput.value)"
  />
  <button (click)="doSearch(myInput.value" class="au-btn-submit">Search</button>
</div>
```
add the search component into [app.component.html](03-frontend/anguler-ecommerce/src/app/app.component.html)
  <app-search></app-search>

[search.component.ts](03-frontend/anguler-ecommerce/src/app/components/search/search.component.ts)
```javascript
export class SearchComponent implements OnInit {
  constructor(private router: Router) { }
  doSearch(value:string){
    console.log(`value=${value}`);
    this.router.navigateByUrl(`/search/${value}`);
  }
```
### 5. Enhance ProductListComponent to search for products with ProductService
[product-list.component.ts](03-frontend/anguler-ecommerce/src/app/components/product-list/product-list.component.ts)
*add some logic to check if has keyword*

  ```javascript
  searchMode: boolean;
  listProducts(){
    this.searchMode=this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode){
      this.handleSearchProducts();
    }else{
      this.handleListProducts();
    }
  }
  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword');
    //now search for the products using keyword
    this.productService.searchProducts(theKeyword).subscribe(
      data=>{this.products=data;}
    )
  }
    handleListProducts(){
    const hasCatogryId: boolean=this.route.snapshot.paramMap.has('id');
    if(hasCatogryId){
      this.currentCategoryId=+this.route.snapshot.paramMap.get('id');
      this.currentCategoryName = this.route.snapshot.paramMap.get('name');
    }else{
      this.currentCategoryId=1;
      this.currentCategoryName="Books";
    }
    this.productService.getProductList(this.currentCategoryId).subscribe(
      data =>{
        this.products = data;
      }
    )
  }
  ```

### 6. Update ProductService to call URL on Spring Boot app
  [product.service.ts](03-frontend/anguler-ecommerce/src/app/services/product.service.ts)
  refactor to add a method to both searchProducts and getProductList
  ```javascript
  {...
    searchProducts(theKeyword: string):Observable<Product[]>{
      //build URL based on keyword and REST API in Spring Boot
      const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;
      return this.getProducts(searchUrl);
    }
    private getProducts(searchUrl: string): Observable<Product[]> {
      return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
        map(responde => responde._embedded.products)
      );
    }
  }
  interface GetResponseProducts{
    _embedded:{
      products: Product[];
    }
  }
  ```

### Event Binding
 - when user clicks the 'Search' button, read the text field
 - In Angular, listen for events with 'Event Binding' (like event handling in other language)
  - Click Search Button
    - `<button (click)="doMyCustomWork()">Search</button>`
      - Listen for 'click' event
      - "doMyCutsomWork()" is Event handler, call a method in Angular component SearchComponent
      - in SearchComponent create the method doMyCustomWork()
  - Reading User Input
    - `<input #myInput type="text" (keyup.enter)="doMyCustomWork(myInput.value)" />`
      - #symbol: template reference variable, provides access to the element
      - Listen for "enter" key
      - in SearchComponent create the method doMyCustomWork(info: string) pass the textValue typed in
- Other Events
  | Name | Description |
  | --- | ----------- |
  | focus | An element has received focus |
  | blur | An element has lost focus |
  | keyup | Any key is released. for a specific key, the enter key, use: keyup.enter |
  | keydown | Any key is pressed |
  | dblclick |The mounse is clicked twice on an element |

### Enhancement: Display a message if products not found
  *? mark is Safe navigation operator*: Guards against null and undefined value in property paths
  ==>if (producys is null/undefined) or (products.length == 0) diplay:'No products found'
  [product-list-grid.component.html](03-frontend/anguler-ecommerce/src/app/components/product-list/product-list-grid.component.html)
  ```HTML
          <!-- if products empty then display a message to user -->
        <div
          *ngIf="products?.length == 0"
          class="alert alert-waring col-md-12"
          role="alert"
        >
          No Products Found.
        </div>
  ```

## Master/Detail view of products
  ### Development Process
  1. Create new component for product details
  2. Add new Angular route for product details
  3. Add router links to the product-list-grid HTML page
  4. Enhance ProductDetailsComponent to retieve product from Product Service
  5. Update ProductService to call URL on Spring Boot app
  6. Update HTML page for ProductDetailsComponent to display product details
  ### 1. Create new component for product details
  `ng generate component components/ProductDetails`

  ### 2. Add new Angular route for product details
  [app.module.ts](03-frontend/anguler-ecommerce/src/app/app.module.ts)
  `  {path: 'products/:id', component:ProductDetailsComponent},`

  ### 3. Add router links to the product-list-grid HTML page
  - User clicks the product from product lists to see details
    - add a link both on product image and product name
  - [product-list-grid.component.html](03-frontend/anguler-ecommerce/src/app/components/product-list/product-list-grid.component.html)
    - `<a routerLink="/products/{{ tempProduct.id }}"></a>`
  
  ### 4. Enhance ProductDetailsComponent to retieve product from Product Service
  [product-details.component.ts](03-frontend/anguler-ecommerce/src/app/components/product-details/product-details.component.ts)
  ```javascript
  export class ProductDetailsComponent implements OnInit {
    product: Product;
    constructor(private productService: ProductService, private route:ActivatedRoute ) { }
    ngOnInit() {
      this.route.paramMap.subscribe(()=>{
        this.handleProductDetail();
      })
    }
    handleProductDetail(){
      //get the 'id' param string. convert string to number using +
      const theProductId: number =+this.route.snapshot.paramMap.get('id')
      this.productService.getProduct(theProductId).subscribe(
        data=>{
          this.product=data;
        }
      )
    }
  }
  ```
  ### 5. Update ProductService to call URL on Spring Boot app
  [product.service.ts](03-frontend/anguler-ecommerce/src/app/services/product.service.ts)
  Returns an observable: JSON data return can be converted directly to Product object
  No need to unwrap the JSON from Spring Data REST
  - URL for retrieving product id: 2===>localhost:8080/api/products/2(Built-in feature of Spring Data REST)
  - `const productUrl=`${this.baseUrl}/${theProductId}`;`
  ### 6. Update HTML page for ProductDetailsComponent to display product details
  - adding img css in [styles.css](03-frontend/anguler-ecommerce/src/styles.css)
  ```CSS
  .detail-img {
    width: 30%;
  }
  ```
  - [product-details.component.html](03-frontend/anguler-ecommerce/src/app/components/product-details/product-details.component.html)
  ```HTML
  <div class="detail-section">
  <div class="container-fluid">
    <img src="{{ product.imageUrl }}" class="detail-img" />
    <h3>{{ product.name }}</h3>
    <div class="price">{{ product.unitPrice | currency: "USD" }}"</div>
    <a href="#" class="primary-btn">Add to cart</a>
    <hr />
    <h4>Product Description</h4>
    <p>
      {{ product.description }}
    </p>
    <a href="/products" class="mt-5">Back to Product List</a>
  </div>
</div>
  ```

###  Async Problem for rendering img
[product-details.component.ts](03-frontend/anguler-ecommerce/src/app/components/product-details/product-details.component.ts)
Property is undefined when declared it: product: Product; 
It is not assigned a value until data arrives from the ProductService method call(async call)
Behind the scenes: when teh property is assigned(data finally arrives), the Angular automaticlly updates HTML template page
==>solution 1: assign a value to the product, create a new instance
`product: Product=new Product();`
solution 2: using 'safe-navigation operatoer'
`<img scr="{{product?.imageUrl}}">`

## Pagination support for products

### Pagination
  - useful for handling large amounts of data
  - Show users a small subset of data
  - click links to view other pages
### Spring Data REST provides pagination support. By default, returns 20 elements
  - customize by passing in parameters
      - page: the page number to access. 0-based, defaults to 0
      - size: the size of page to return items per page. defaults 20
      - example: *http://.......products?page=3&size=10*
  - Spring Data REST - Response Meta Data
    - the response meta data has valuable info
    ```
    "page":{
      "size": 10, //(size of the page)
      "totalElements": 200, //(Grand total of All elements in dt, just the count)
      "totalPages": 20, //(total page avalable)
      "number": 0 //current page number
    }
    ```
### Pagination with Angular
  - many pagination solutions for Angular
  - make use of a popular component framework: [ng-bootstrap](https://ng-bootstrap.github.io)
    - Components in ng-bootstrap: datapicker, nav, .... Basic pagination
      - Pagination Component
        - page: 1-based defaults to 1
        - pageSize: defaults to 10
        - collectionSize: total number of items
        - pageChange: Event handler for page change events
        - basic example: COMPONENT WILL GENERATE LINKS FOR PAGINATION
          ```HTML
          <ngb-pagination [(page)]="thePageNumber"
                          [pageSize] = "thePageSize"
                          [collectionSize]="theTotalElements"
                          [pageChange]="listProducts()">
          </ngb-pagination>
          ```
### Developnmemt Process
1. Intsall ng-bootstrap
      - cml
       `ng add @angular/localize` //dependency for Angular 9+
       `npm install @ng-bootstrap/ng-bootstrap`
      - import the module for ng-boostrap [app.module.ts](03-frontend/anguler-ecommerce/src/app/app.module.ts)
      ```javascript
      @NgModule({
        ...
        imports: [
          RouterModule.forRoot(routes),
          BrowserModule,
          HttpClientModule,
          NgbModule
        ],
      ```
2. Refactor the interface for: GetResponseProducts
       1. currently using the interface GetResponseProducts
       2. Maps JSON data form REST API to our TypeScript objects[product.service.ts](03-frontend/anguler-ecommerce/src/app/services/product.service.ts)
        ```javascript
        interface GetResponseProducts{
          _embedded:{
            products: Product[];
          },
          page:{
            size: number,
            totalElement: number,
            totalPages: number,
            number: number
          }
        }
        ```
3. Add pagination support to ProductSevice
       [product.service.ts](03-frontend/anguler-ecommerce/src/app/services/product.service.ts)
       ```javascript
        getProductListPaginate(thePage: number, 
                              thePageSize:number, 
                              theCategoryId:number): Observable<GetResponseProducts>{
          // build URL based on category id, page and size
          const url= `${this.baseUrl}/search/findByCategoryId`
                    + `?id=${theCategoryId}&page=${thePage}&size=${thePageSize}`;
          return this.httpClient.get<GetResponseProducts>(url);
        } 
       ``` 
4. Update ProductListComponent to handle pagination[product-list.component.ts](03-frontend/anguler-ecommerce/src/app/components/product-list/product-list.component.ts)
       1. adding properties for pagination
       2. call service and pass in parameters
       3. Pagination component: page as 1 based but Spring Data REST: pages are 0 based
       4. when data arrives from product service...then set properties based on the data
       5. MUST CHECK CURRENT Category ID
        ```javascript
        export class ProductListComponent implements OnInit {
          ...
          //adding previousCategoryId for tracking
          previousCategoryId: number;
          //new properties for pagination
          thePageNumber: number=1;
          thePageSize: number =10;
          theTotalElements: number =0;
          listProducts(){
            this.searchMode=this.route.snapshot.paramMap.has('keyword');
            if(this.searchMode){
              this.handleSearchProducts();
            }else{
              this.handleListProducts();
            }
          }

          handleListProducts(){
            ...
            //check if we have a different category than previous
            //Note: Angular will reuse a component if it is currently being viewd
            //
            //if we have a different category id than previous
            //we have to set thePageNumber back to 1
            if(this.currentCategoryId!=this.previousCategoryId){
              this.thePageNumber=1;
            }
            this.previousCategoryId=this.currentCategoryId;

            this.productService.getProductListPaginate(this.thePageNumber -1, this.thePageSize, this.currentCategoryId).subscribe(
              this.processResult()
            );
          }
          private processResult() {
            return data =>{
              this.products = data._embedded.products;
              this.thePageNumber=data.page.number +1;
              this.thePageSize=data.page.size;
              this.theTotalElements=data.page.totalElements;
            }
          }
        }
        ```
5. Enhance HTML template to use ng-bootstrap pagination component   [product-list-grid.component.html](03-frontend/anguler-ecommerce/src/app/components/product-list/product-list-grid.component.html)
       1. special Angular syntax for Two-way Data Binding 
          1. example: 
             1. [(page)]: parameter of ngb-pagination component
             2. "thePageNumber": property of ProductListComponent
                1. when user clicks "page" navigation link
                2. in TypeScript component "thePageNumber" property is updated based on user action
                3. if our TypeScript code updates "thePageNumber" then UI component is updated automatically.(highlight current page number)
    ```HTML
      <!-- begin footer -->
      <div class="footer-pagination">
        <div class="row">
          <div class="col-md-6"></div>
          <div class="col-md-6">
            <div class="row">
              <div class="col-md-9" style="padding-left: 30%">
                <ngb-pagination
                  [(page)]="thePageNumber"
                  [pageSize]="thePageSize"
                  [collectionSize]="theTotalElements"
                  (pageChange)="listProducts()"
                >
                </ngb-pagination>
              </div>
            </div>
          </div>
        </div>
      </div>
    ```
### Adding Page Size Selection Development Process
1. Add drop-down list for page size to HTML template
   [product-list-grid.component.html](03-frontend/anguler-ecommerce/src/app/components/product-list/product-list-grid.component.html)
   ```HTML
              <div class="col-md-3 mt-2" style="text-align: right">
                <span class="mr-2">Page Size</span>
                <select #mySelect (change)="updatePageSize(+mySelect.value)">
                  <option selected="true">5</option>
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
   ```
   Event binding: on change
   when user slects a page, then call method: updatePageSize(...) which definded in component.ts file
2. Update ProductListComponent for setting page size
   [product-list.component.ts](03-frontend/anguler-ecommerce/src/app/components/product-list/product-list.component.css)
   ```JavaScript
   updatePageSize(pageSize: number){
     this.thePageSize=pageSize;
     this.thePageNumber=1;
     this.listProducts();
   }
   ```
### Setting Max Size and Boundary Links
  - Show only a max number of pages(lots of items and too many pages)
    EXAMPLE: only shows a max of 5 pages, includes "..." and last/first page
  ```HTML
  <ngb-pagination
      [maxSize]="5"
  ```
  - show boundray links: << and >>, jump to begining or end page
  `   [boundaryLinks]="true" `
### Add pagination support for keyword search
1. Add pagination support to ProductService
   [product.service.ts](03-frontend/anguler-ecommerce/src/app/services/product.service.ts)
  ```Javascript
  searchProductsPaginate(theKeyword: string,
                        thePageSize: number,
                        thePage: number):Observable<GetResponseProducts>{
    //build URL based on keyword and REST API in Spring Boot
    const searchUrl = `${this.baseUrl}/search/findByNameContaining`
                      +`?name=${theKeyword}&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }
  ```
2. Update ProductListComponent to handle pagination
   [product-list.component.ts](03-frontend/anguler-ecommerce/src/app/components/product-list/product-list.component.ts)
   update handleSearchProducts()
  ```javascript
  previousKeyword:string=null;
  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword');
    //if we have a different keyword than previous
    //then set thePageNumber to 1
    if(this.previousKeyword !=theKeyword){
      this.thePageNumber=1;
    }
    this.previousKeyword=theKeyword;
    console.log(`currentKeyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);
    //now search for the products using keyword
    this.productService.searchProductsPaginate(this.thePageNumber-1,
                                                this.thePageSize,
                                                theKeyword).subscribe(this.processResult())
  }
  ```
  


## Add products to shopping cart(CRUD)
### Overview
  1. Cart Status Component: On main page, display total price and quantity
  2. Cart Details Page: list the items in the cart
  3. Cart Details Page: add/remove items
  4. Checkout Button
  5. Checkout Form

### Part 1 Development Process
  1. Create a new component: CartStatusComponent
   `ng generate component components/cart-status`
  2. Add HTML template for CartStatusComponent
    [cart-status.component.html](03-frontend/anguler-ecommerce/src/app/components/cart-status/cart-status.component.html)
    ```HTML
    <div class="cart-area d-n">
      <a href="shopping-detail.html">
        <div class="total">
          19.22
          <span> 2</span>
        </div>
        <i class="fa fa-shopping-cart" aria-hidden="true"></i>
      </a>
    </div>
    ```
    [app.component.html](03-frontend/anguler-ecommerce/src/app/app.component.html)
    `<app-cart-status></app-cart-status>`
  3. Add click handler for "Add to cart" button
    [product-list-grid.component.html](03-frontend/anguler-ecommerce/src/app/components/product-list/product-list-grid.component.html)
    ```HTML
            <button (click)="addToCart(tempProduct)"   class="btn btn-primary btn-sm">
              Add to cart
            </button>
    ```
  4. Update ProductListComponent with click handler method
    [product-list.component.ts](03-frontend/anguler-ecommerce/src/app/components/product-list/product-list.component.ts)
    ```Javascript
    addToCart(theProduct:Product){
        console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);
      //TODO the real work
    }
    ```
### Part 1.2 Development Process
  - Application Interatcion: 
    - ProductListComponent("AddToCart"button)    
    - CartStatusComponent(smallcartIconwithtotalpricequantity) (*Observer*)
    - CartService (*Observable*)
      1. CartStatusComponent ---- subscribe for events --> CartService
      2. ProductListComponent---- addToCart(...)----> CartService
      3. CartService ---publish events to all subscribers--->CartStatusComponent
      4. CartStatusComponent: update UI for total price and quantity
  - Steps   
    1. Create Model class: CartItem
       `ng generate class common/cartItem`
       [cart-item.ts](03-frontend/anguler-ecommerce/src/app/common/cart-item.ts)
       contains essential fields of Product for use in the cart
       ```Javascript
        export class CartItem {
            id:string;
            name:string;
            imageUrl:string;
            unitPrice:number;
            quantity:number;
            constructor(product:Product){
                this.id = product.id;
                this.name=product.name;
                this.imageUrl=product.imageUrl;
                this.unitPrice=product.unitPrice;
                this.quantity=1;
            }
        }
       ```
    2. Develop CartService
      `ng generate service services/cart`
      [cart-service.ts](03-frontend/anguler-ecommerce/src/app/services/cart.service.ts)
      - our shopping cart is an array of CartItem Objects
      - Subject is a subclass of Observable: we use it to publish events to our code, and the event will be sent to all of the subscribers
      - .next(...) pulish/send event
      ```Javascript
      export class CartService {
        //our shopping cart is an array of CartItem Objects
        cartItems: CartItem[]=[];
        totalPrice: Subject<number> = new Subject<number>();
        totalQuantity:  Subject<number> = new Subject<number>();
        constructor() { }
        addToCart(theCartItem: CartItem){
          //check if we already have the item in our cart
          let alreadyExistsInCart: boolean=false;
          let existingCartItem: CartItem=undefined;

          if(this.cartItems.length>0){
            //find the item in the cart based on item id
            for(let tempCartItem of this.cartItems){
              if(tempCartItem.id === theCartItem.id){
                existingCartItem=tempCartItem;
                break;
              }
            }
            //check if we found it in cart
            alreadyExistsInCart=(existingCartItem!=undefined);
          }
          //if the item is already in the cart
          if(alreadyExistsInCart){
              //increment the quantity
            existingCartItem.quantity++;
          }else{
              //just add the item into the array
            this.cartItems.push(theCartItem);
          }
            //compute cart quantity and the total price
          this.computeCartTotals();
        }
        computeCartTotals() {
          let totalPriceValue: number =0;
          let totalQuantityValue: number =0;
          for(let currentCartItem of this.cartItems){
            totalPriceValue+=currentCartItem.unitPrice*currentCartItem.quantity;
            totalQuantityValue+=currentCartItem.quantity;
          }
          //publish the new values ... all subscribers will recieve the new data
          //one event for totalPrice
          //one event for totalQuantity
          //.next(...) publish/send events
          this.totalPrice.next(totalPriceValue);
          this.totalQuantity.next(totalQuantityValue);
        }
      }
      ```
    3. Modify ProductListComponent to call CartService
      [product-list.component.ts](03-frontend/anguler-ecommerce/src/app/components/product-list/product-list.component.ts)
      ```javascript
        constructor(private productService: ProductService,
              private cartService: CartService,
              private route:ActivatedRoute 
              ) { }
        addToCart(theProduct:Product){
          console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);
          const theCartItem = new CartItem(theProduct);
          //TODO the real work
          //call the CartService
          this.cartService.addToCart(theCartItem)
        }
      ```
    4. Enhance CartStatusComponent to subscibe to CartService
      [cart-status.component.ts](03-frontend/anguler-ecommerce/src/app/components/cart-status/cart-status.component.ts)
      ```javascript
       {... 
        totalPrice: number=0.00;
        totalQuantity:number=0;
        constructor(private cartService:CartService) { }

        ngOnInit(): void {
          this.updateCartStatus();
        }
        updateCartStatus(){
          //subscribe for events
          //subscribe to the cart status totalPrice
          this.cartService.totalPrice.subscribe(
            data=>this.totalPrice=data
          );
          //subscibe to teh cart status totalQuantity
          this.cartService.totalQuantity.subscribe(
            data=>this.totalQuantity=data
          );
        }
      ```
    5. Update CartStatusComponent HTML to display cart total price and quantity
      ```HTML
      <div class="total">
        {{ totalPrice | currency: "USD" }}
        <span> {{ totalQuantity }}</span>
      </div>
      ```
  - Refactor Cart Service Overview
    - using Array.find(...): returns the first element in an array t hat passes a aiven test
      - executes the test for each element in the array until the test passes
      - if passes, then returns the first element passed
      - if fails to all elements in the array, then return undefined
    [cart.service.ts](03-frontend/anguler-ecommerce/src/app/services/cart.service.ts)
    ```javascript
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);
    ```
### Part 1.3 Development Process
  Add Products to Cart in product Detail View
   1. Add click handler for 'Add to cart' button on product-details page
      [product-detials.component.html](03-frontend/anguler-ecommerce/src/app/components/product-details/product-details.component.html)
       ```HTML
       <button (click)="addToCart()" class="btn btn-primary btn-sm">
         Add to cart
       </button>
       ```
   2. Update ProductDetailsComponent witgh click handler method
      ```javascript
       addToCart(){
         console.log(`Adding to cart: ${this.product.name}, ${this.product.unitPrice}`);
         //TODO the real work
         const theCartItem = new CartItem(this.product);
         this.cartService.addToCart(theCartItem);
       }
      ```
   3. Appliction Interaction
         1. CartStatusComponent ---- subscribe for events --> CartService
         2. *ProductDetailsComponent---- addToCart(...)----> CartService*
         3. CartService ---publish events to all subscribers--->CartStatusComponent
         4. CartStatusComponent: update UI for total price and quantity




### Part 2 Development Process CartDetailsPage
  The Cart Details Page list all added products(image, detials(name,price), quantital and subtotal price) in the cart
  1. create CartDetailsComponent which is a table to list all products
     `ng generate component components/cart-details`
  2. Add new route for CartDetailComponent
    [app.module.ts](03-frontend/anguler-ecommerce/src/app/app.module.ts)
    `{path:'cart-details', component:CartDetailsComponent}`
  3. Update link for Shopping Cart icon
    [cart-status.component.html](03-frontend/anguler-ecommerce/src/app/components/cart-status/cart-status.component.html)
    when user clicks CartStatusComponent then use new route: /cart-details to view CartDetailsComponent
    `<a routerLink="/cart-details">`
  4. Modify CartDetailsComponent to retireve cart items
    list cartItems from cartService
    ```Javascript
      export class CartDetailsComponent implements OnInit {
        cartItems: CartItem[]=[];
        totalPrice: number=0;
        totalQuantity: number =0;
        constructor(private cartService: CartService) { }
        ngOnInit(): void {
          this.listCartDetails();
        }
        listCartDetails(){
          //get a handle to the cart items
          this.cartItems=this.cartService.cartItems;
          //subscribe to the cart totalPrice
          this.cartService.totalPrice.subscribe(
            data=>this.totalPrice=data
          )
          //subscribe to the cart totalQuantity
          this.cartService.totalQuantity.subscribe(
            data=>this.totalQuantity=data
          )
          //compute cart total price and total quantity
          this.cartService.computeCartTotals();
        }
      }
    ```
  5. Add HTML template for CartDetailsComponent
    ```HTML
      <table class="table table-bordered">
        <tr>
          <th width="20%">Product Image</th>
          <th width="50%">Product Detail</th>
          <th width="30%"></th>
        </tr>
        <tr *ngFor="let tempCartItem of cartItems">
          <td>
            <img
              src="{{ tempCartItem.imageUrl }}"
              class="img-responsive"
              width="150px"
            />
          </td>
          <td>
            <p>{{ tempCartItem.name }}</p>
            <p>{{ tempCartItem.unitPrice | currency: "USD" }}</p>
          </td>
          <td>
            <div class="items">
              <label>Quantity: </label>{{ tempCartItem.quantity }}
            </div>
            <p class="mt-2">
              Subtotal:
              {{
                tempCartItem.quantity * tempCartItem.unitPrice | currency: "USD"
              }}
            </p>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td style="font-weight: bold">
            <p>Total Quantity: {{ totalQuantity }}</p>
            <p>Shipping: FREE</p>
            <P>Total Price: {{ totalPrice | currency: "USD" }}</P>
          </td>
        </tr>
      </table>
    ```
    Adding condition for cart is empty
    ```HTML
       <div *ngIf="cartItems.length > 0">
         <table></table>
          <!-- if cart is empty then display a message -->
      <div
        *ngIf="cartItems.length == 0"
        class="alert alert-warning col-md-12"
        role="alert"
      >
        Your shopping cart is empty
      </div>
    ```
  #### Increment item quantity from Shoppipng cart page
  Steps:
  1. Modify CartDetailComponent HTML template
     1. Add the 'increment' button
     2. Add click handler for the 'increment' button on HTML template
    ```HTML
              <div class="items">
                <label>Quantity: </label>
                <div class="row no-gutters">
                  <div class="col">
                    <button
                      (click)="decrementQuantity(tempCartItem)"
                      class="btn btn-primary btn-sm"
                    >
                      <i class="fas fa-minus"></i>
                    </button>
                  </div>
                  <div class="col ml-4 mr-2">{{ tempCartItem.quantity }}</div>
                  <div class="col">
                    <button
                      (click)="incrementQuantity(tempCartItem)"
                      class="btn btn-primary btn-sm"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                  <div class="col-8"></div>
                </div>
              </div>
    ```   
  2. Update CartDetailsComponent with click handler method
    [cart-details.component.ts](03-frontend/anguler-ecommerce/src/app/components/cart-details/cart-details.component.ts)
    ```JAVASCRIPT
    incrementQuantity(theCartItem: CartItem){
      this.cartService.addToCart(theCartItem);
    }
    ```
  #### Decrement/Remove item from Shoppipng cart page
  1. Add click handler for the 'decrement' button on HTML template
    `(click)="decrementQuantity(tempCartItem)"`
  2. Update CartDetailsComponent with click handler method [cart-details.component.ts](03-frontend/anguler-ecommerce/src/app/components/cart-details/cart-details.component.ts)
     ```JAVASCRIPT
       decrementQuantity(theCartItem: CartItem){
          this.cartService.decrementQuantity(theCartItem);
        }
     ```
  3. Modify CartService with supporting method[cart.service.ts](03-frontend/anguler-ecommerce/src/app/services/cart.service.ts)
    ```Javascript
        decrementQuantity(theCartItem: CartItem) {
          theCartItem.quantity--;
          if(theCartItem.quantity===0){
            this.remove(theCartItem);
          }else{
            this.computeCartTotals();
          }
        }
        remove(theCartItem:CartItem){
          //get the index of item in the array
          const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id == theCartItem.id);
          //if found, remove the item from the array at the given index
          if(itemIndex>-1){
            this.cartItems.splice(itemIndex,1);
            this.computeCartTotals();
          }
        }
    ```
  4. Repeat process for 'Remove' button
    ```HTML
    ```       <div>
                <button
                  (click)="remove(tempCartItem)"
                  class="btn btn-primary btn-sm"
                >
                  Remove
                </button>
              </div>
    ```Javascript
        remove(theCartItem: CartItem){
          this.cartService.remove(theCartItem);
        }
    ```

## Shopping cart check out

### Overview of Angular Forms
  - Can easily build forms in Angular
  - Supporst form data-binding, validation and processing
  - Angular provides two types of forms
    - Reactive forms
      - leverages programmatic API for form building
      - Scaleable solution that designed for large, complex forms
      - Forms can be easily reused and tested
    - Template-driven forms
      - Targeted for small, simple forms
      - Not a scalable solution for large, complex forms

  #### Key Components 
    | Name      | Description |
    | ----------- | ----------- |
    | FormControl | Individual control that tracks the value and validation status |
    | FormGroup   | A collection of controls. Can create nested groups |
    - our Checkout Form will using nested groups
      - Customer
      - Shiping Address
      - Billing Address
      - Credit Card
      - Review Your Order

  ### Form Construction and Layout Developmemnt Process
    1. Generate our checkout component
        `ng generate component components/checkout`
    2. Add a new route for checkout component [app.module.ts](03-frontend/anguler-ecommerce/src/app/app.module.ts)
        `{path: 'checkout', component:CheckoutComponent},`
    3. Create a new checkout button and link to chekout component[cart-detials.component.html](03-frontend/anguler-ecommerce/src/app/components/cart-details/cart-details.component.html)
        `<a routerLink="/checkout" class="btn btn-primary">Checkout</a>`
    4. Add support for reactive forms
        [app.module.ts](03-frontend/anguler-ecommerce/src/app/app.module.ts)
        ```javascript
            import {  ReactiveFormsModule } from '@angular/forms';
              ReactiveFormsModule
            ]
        ```
        [checkout.component.ts](03-frontend/anguler-ecommerce/src/app/components/checkout/checkout.component.ts)
        `import { FormBuilder, FormGroup } from '@angular/forms';`
    5. Define form in [checkout.component.ts](03-frontend/anguler-ecommerce/src/app/components/checkout/checkout.component.ts)
        - inject the form builder in constructor
            ```javascript
              checkoutFormGroup: FormGroup;
              constructor(private formBuilder: FormBuilder) { }
            ```
        - build form
          - FormGroup name is the key of the group: customer
          - FormControl names: these are teh form fileds
          - FormControl initial values: empty string
            ```javascript
                this.checkoutFormGroup = this.formBuilder.group({
                  customer: this.formBuilder.group({
                    firstName:[''],
                    lastName:[''],
                    email:['']
                  })
                })
            ```
        - Method to call when submit button is clicked onSubmit
          ```javascript
            onSubmit(){
              console.log("Handling the submit button");
              console.log(this.checkoutFormGroup.get('customer').value);
            }
          ```
    6. Layout form controls in HTML template 
        [formGroup], formGroupName, formControlName are all defined in [checkout.component.ts]
        ```HTML
        <form [formGroup]="checkoutFormGroup" >
            <!-- customer form group -->
            <div formGroupName="customer" class="form-area">
              <h3>Customer</h3>
              <div class="row">
                <div class="col-md-2"><label for="">First Name</label></div>
                <input formControlName="firstName" type="text" />
              </div>
          ...
        ```
    7. Add event handler for from submission
        (ngSubmit)="onSubmit()" 
      ```HTML
      <form [formGroup]="checkoutFormGroup" (ngSubmit)="onSubmit()">
          <div class="text-center">
            <button type="submit" class="btn btn-info">Purchase</button>
          </div>
      ```
    8. Adding Shipping Address, Billing Address, credit card info
       1. adding form groups in ts: `shippingAddress: this.formBuilder.group({....`
       2. adding html template
       3. adding a checkbox to copy value from shippingAddress to billingAddress
            ```HTML
                    <div class="input-space">
                      <label class="au-checkbox"
                        ><input
                          type="checkbox"
                          (change)="copyShippingAddressToBillingAddress($event)"
                        />
                        <span class="au-checkmark"></span>Billing Address same as Shipping Address
                      </label>
                    </div>
            ```
            [checkout.component.ts](03-frontend/anguler-ecommerce/src/app/components/checkout/checkout.component.ts)
            ```Javascript
              copyShippingAddressToBillingAddress(event){
                if(event.target.checked){
                  this.checkoutFormGroup.controls.billingAddress
                  .setValue(this.checkoutFormGroup.controls.shippingAddress.value)
                }else{
                  this.checkoutFormGroup.controls.billingAddress.reset();
                }
              }
            ```
    9. Adding Order Review: define totalPrice and totalQuantity

  #### Populating Drop-Down Lists in form
  ##### Development Process for creditcard month and year:
     1. Generate our form service
        `ng generate service services/eShopForm`
     2. add methods to the form service fro months and years
            [e-shop-form.service](03-frontend/anguler-ecommerce/src/app/services/e-shop-form.service.ts)
         - importing library from rxjs: Reactive JavaScript
         - wrap the object(here is array of number) as an Observable using 'of' operator from 'rxjs'
            ```javaScript 
                import { Observable } from 'rxjs';
                import {of} from 'rxjs'
                  //return an observable array of numbers
                getCreditCardMonths(startMonth: number):Observable<number[]>{
                  let data: number[]=[];
                  //build an array for 'Month' dropdown list
                  // - start at desired startMonth and loop until 12
                  for(let theMonth = startMonth; theMonth<=12;theMonth++){
                    data.push(theMonth)
                  }                 
                  return of(data);
                }
                  getCreditCardYears():Observable<number[]>{
                    let data: number[]=[];
                    //build an array for 'Year dropdown list
                    // - start at current year and loop for next 10
                    const startYear: number = new Date().getFullYear();
                    const endYear: number=startYear+10;
                    for(let theYear = startYear; theYear<=endYear;theYear++){
                      data.push(theYear)
                    }
                    //wrap the objecy(here is array of number) as an Observable using 'of' operator from 'rxjs'
                    return of(data);
                }
            ```
     3. update checkout component to retrieve the months and years from the service[checkout.component.ts](03-frontend/anguler-ecommerce/src/app/components/checkout/checkout.component.ts)
        - declare the year and month array, 
        - inject eShopFormService in constructor
        - get the current month: JavaScript Date Object the month is 0-based(0-11)
        ```javascript
            creditCardYear: number[]=[];
            creditCardMonth: number[]=[];
            constructor(private formBuilder: FormBuilder,
                    private eShopFormService: EShopFormService) { }
                    ...
            //populate credit card months
            //get current month(JS month is 0-based)
            const startMonth: number = new Date().getMonth()+1;
            this.eShopFormService.getCreditCardMonths(startMonth).subscribe(
              data=>{
                console.log("Retrieved credit card months: "+ JSON.stringify(data));
                this.creditCardMonth=data
              }
            )
            //populate credit card years
            this.eShopFormService.getCreditCardYears().subscribe(
              data=>{
                this.creditCardYear=data;
              }
            )
        ```

     4. Update HTML template to populate drop-down lists for months and years[checkou.component.html](03-frontend/anguler-ecommerce/src/app/components/checkout/checkout.component.html)
      ```HTML
           <option *ngFor="let month of creditCardMonth">
              {{ month }}
      ```
     5. Improvement: Dependent Fields: the month should depend on the year(if not current year, month should starts from 1)
        1. Update HTML template
           1. for the expiration years drop-down list
           2. add event bindindg for change event
            `<select formControlName="expirationYear" (change)="handleMonthsAndYears()">`
        2. Update checkout Component, add event handler
           1. read the selected year
           2. update the list of months based on selected year
           ```javascript
             handleMonthsAndYears(){
                const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
                const currentYear: number = new Date().getFullYear();
                const selectedYear: number = Number(creditCardFormGroup.value.expirationYear)
                //if the current year equals the selected year, then month starts from current month
                let startMonth: number;
                if(currentYear===selectedYear){
                  startMonth=new Date().getMonth()+1;
                }else{
                  startMonth=1;
                }
                //populate credit card months
                this.eShopFormService.getCreditCardMonths(startMonth).subscribe(
                  data=>{
                    console.log("Retrieved credit card months: "+ JSON.stringify(data));
                    this.creditCardMonth=data
                  }
                )
                //populate credit card years
                this.eShopFormService.getCreditCardYears().subscribe(
                  data=>{
                    this.creditCardYear=data;
                  }
                )
              }
           ```
  ##### Development Process for populating country and state(backend REST API)
  ###### Backend
      1. create database tables
          country(id, code, name) 1 to many state(id, name, country_id)
          @OneToMany                         @ManyToOne
          ```SQL
          USE `full-stack-ecommerce`;
          SET foreign_key_checks = 0;
          --
          -- Table structure for table `country`
          --
          DROP TABLE IF EXISTS `country`;

          CREATE TABLE `country` (
            `id` smallint unsigned NOT NULL,
            `code` varchar(2) DEFAULT NULL,
            `name` varchar(255) DEFAULT NULL,
            PRIMARY KEY (`id`)
          ) ENGINE=InnoDB;

          DROP TABLE IF EXISTS `state`;
          CREATE TABLE `state` (
            `id` smallint unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) DEFAULT NULL,
            `country_id` smallint unsigned NOT NULL,
            PRIMARY KEY (`id`),
            KEY `fk_country` (`country_id`),
            CONSTRAINT `fk_country` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`)
          ) ENGINE=InnoDB AUTO_INCREMENT=1;
          ```
      2. develop JPA Enities: Country.java, State.java
        ```Java
            @Entity
            @Table(name="country")
            @Getter
            @Setter
            public class Country {
                @Id
                @GeneratedValue(strategy = GenerationType.IDENTITY)
                @Column(name="id")
                private  int id;
                @Column(name="code")
                private String code;
                @Column(name="name")
                private String name;
                @OneToMany(mappedBy = "country")
                private List<State> states;
            }
            @Entity
            @Table(name="state")
            @Data
            public class State {
                @Id
                @GeneratedValue(strategy= GenerationType.IDENTITY)
                @Column(name="id")
                private int id;
                @Column(name="name")
                private String name;
                @ManyToOne
                @JoinColumn(name="country_id")
                private Country country;
            }
        ```
      3. create Spring Data Repository
        ```java
        @CrossOrigin("http://localhost:4200")
        @RepositoryRestResource
        public interface StateRepository extends JpaRepository<State, Integer> {
            //to retrieve states for a given country code
            //http://localhost:8080//api/states/search/findByCountryCode?code=IN
            List<State> findByCountryCode(@Param("code") String code);
        }

        @CrossOrigin("http://localhost:4200")
        @RepositoryRestResource(collectionResourceRel = "countries", path="countries")
        //expose/countries endpoint
        public interface CountryRepository extends JpaRepository<Country, Integer> {
        }
        ```
      4. Updating Spring Data REST configs
         refactor the method to disableHttp method for country and state too(only read)
         ```java
            disableHttpMethods(Country.class, config, theUnsupportedActions);
            disableHttpMethods(State.class, config, theUnsupportedActions);
            private void disableHttpMethods(Class theClass, RepositoryRestConfiguration config, HttpMethod[] theUnsupportedActions) {
                  config.getExposureConfiguration()
                  .forDomainType(theClass)
                  .withItemExposure((metdata, httpMethods) -> httpMethods.disable(theUnsupportedActions))
                  .withCollectionExposure((metdata, httpMethods) -> httpMethods.disable(theUnsupportedActions));
           }
         ```
  ###### Frontend: user selects a country==>then populate states for the selected country
    1. Create TypeScript classed for Country and State
        `ng generate class common/Country`
        `ng generate class common/State`
        ```javascript
        export class Country {
            id:number;
            code: string;
            name:string;
        }
        ```
    2. Add methods to the form service for countries and states[e-shop-form.service.ts](03-frontend/anguler-ecommerce/src/app/services/e-shop-form.service.ts)
    ```Javascript
      {
        private stateUrl="http://localhost:8080/api/states";
        private countryUrl="http://localhost:8080/api/countries";
        //returns an observable, map the JSON datat from Spring data REST to country array
        getCountries() : Observable<Country[]>{
          return this.httpClient.get<GetResponseCountry>(this.countryUrl).pipe(
            map(responese=>responese._embedded.countries)
          )
        }
        getStates(theCountryCode: string) : Observable<State[]>{
          const url=`${this.stateUrl}/search/findByCountryCode`+`?code=${theCountryCode}`
          return this.httpClient.get<GetResponseStates>(url).pipe(
            map(responese=>responese._embedded.states)
          )
        }

      }
      //unwraps the JSON from Spring Data REST _embedded entry
      interface GetResponseCountry{
        _embedded:{
          countries: Country[];
        }
      }
      interface GetResponseStates{
        _embedded:{
          states: State[];
        }
      }
    ```
    3. Update checkout component to retrieve the countries from services[checkout.component.ts](03-frontend/anguler-ecommerce/src/app/components/checkout/checkout.component.ts)
    ```javascript
      countries:Country[]=[];
      ngOnInit():void{
        ...
          //populate countries
          this.eShopFormService.getCountries().subscribe((data)=>{this.countries = data;})
      }
    ```
    4. Update HTML template to populate drop-down lists for the countries[checkout.component.html](03-frontend/anguler-ecommerce/src/app/components/checkout/checkout.component.html)
      - [ngValue]: keep reference for country object to use it later
      ```HTML
                <select
                  formControlName="country"
                  (change)="getStates('shippingAddress')"
                >
                  <option *ngFor="let country of countries" [ngValue]="country">
                    {{ country.name }}
                  </option>
                </select>
      ```
    5. Add event handler for checkout component
       1. Read selected country, retireve a list of states based on selected country[checkout.component.ts](03-frontend/anguler-ecommerce/src/app/components/checkout/checkout.component.ts)
        ```javascript
            shippingAddressStates: State[]=[];
            billingAddressStates: State[]=[];
            getStates(formGroupName:string){
              const formGroup = this.checkoutFormGroup.get(formGroupName);
              const countryCode = formGroup.value.country.code;
              this.eShopFormService.getStates(countryCode).subscribe(
                data=>{
                  if(formGroupName ==="shippingAddress"){
                    this.shippingAddressStates=data;
                  }else{
                    this.billingAddressStates=data;
                  }
                  //select first item by default
                  formGroup.get('state').setValue(data[0])
                }
              )
            }
        ```
    6. Update HTML template to populate drop-down lists for states
        ```HTML
                  <option
                    *ngFor="let state of shippingAddressStates"
                    [ngValue]="state"
                  >
                    {{ state.name }}
                  </option>
        ```
        also update billing address country and states
        - bug fixed: checkedbox for same billingAddress

  ##### Form Validation
  ##### Angular built-in validation rules
      - required: Must be non-empty
      - min: a number >=value
      - max: a number <=value
      - minLength: length >=value
      - maxLength
      - pattern: must match a reqular expression pattern
      - email
      - others...
        - Additional validation features
          - define cutsom validators
          - cross-field validation
          - asychronous validators
  ###### Development Process for user info
    1. Specify validation rules for the form controls
           1. Recall that a form field is represented by FormControl object
           2. Create the **FormControl** and pass in initial value and validators
              basic synatx `new FormControl(initialValue, validators, ...)`
              example: `new FormControl('',[Validators.required, Validators.minLength(2)])`//array of validators
          [checkout.component.ts](03-frontend/anguler-ecommerce/src/app/components/checkout/checkout.component.ts)
          ```javascript
            customer: this.formBuilder.group({
              firstName: new FormControl('',[Validators.required, Validators.minLength(2)]),
              lastName: new FormControl('',[Validators.required, Validators.minLength(2)]),
              email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
            }),
          ```
    2. Define Getter methods to access form controls
          [checkout.component.ts](03-frontend/anguler-ecommerce/src/app/components/checkout/checkout.component.ts)
          ```javascript
          get firstName(){
            return this.checkoutFormGroup.get('customer.firstName');
          }
          ```
    3. Update HTML template to display error message
            - if validation fails then display error messages
            - only display validation errors if user has interacted with the form
              - when user changes field value, the control is marked as 'dirty'
              - when the field loses focus, the control is marked as 'touched'
          ```HTML
                <input formControlName="firstName" type="text" />
                <div
                  *ngIf="
                    firstName.invalid && (firstName.dirty || firstName.touched)
                  "
                  class="alert alert-danger"
                >
                  <div *ngIf="firstName.errors.required">
                    First Name is required
                  </div>
                  <div *ngIf="firstName.errors.minlength">
                    First Name must be at least 2 characters long
                  </div>
                </div>
          ```
          
    4. Add event handler to check validation status when submit button clicked
          ```JAVASCRIPT
            onSubmit(){
              if(this.checkoutFormGroup.invalid){
                this.checkoutFormGroup.markAllAsTouched();
              }
            }
          ```
  ###### White Space: in the required fields, only enter whiltespace passes validation which should failed
      - solve by creating a Custom Validator: notOnlyWhiltespace
        1. Define custom validator rule [eshop-validators.ts](03-frontend/anguler-ecommerce/src/app/validators/eshop-validators.ts)
          - if validation check fails then return validation error(s), else return null
          - ValidationErrors: Map of errors returned from failed validation checks
          ```javascript
           import { FormControl, ValidationErrors } from '@angular/forms';
            export class EshopValidators{
                //define whitespace validatoion
                //if validation check fails then return validation error(s), else return null
                // Map of errors returned from failed validation checks
                static notOnlyWhitespace(control: FormControl): ValidationErrors{
                    //check if string only contains whitespace
                    if((control.value!=null)&& (control.value.trim().length ===0)){
                        //invalid: return error object
                        //Validation error key: 'notOnlyWhitespace'
                        //The HTML template will check for this error key
                        return {'notOnlyWhitespace': true}
                    }else{
                        //valid, return null
                        return null;
                    }
                }
            }
          ```
        2. Specify custom validator rule for the form controls
            `firstName: new FormControl('',[Validators.required, Validators.minLength(2), EshopValidators.notOnlyWhitespace], ),`
        3. Update HTML template to display error message
           1. if validation fails then display error message
           2. reference to our custom validation error key
            ```HTML
                  <div *ngIf="firstName.errors.required || firstName.errors.notOnlyWhitespace">
                    First Name is required
                  </div>
            ```

  ###### Development Process for Shipping/Billing/Credit Card Validation
  1. Specify validation rules for the form controls
  2. Define Getter methods to access form controls
  3. Update HTML template to display error messages
  
  ##### Form - Update Review Cart Totals
   - Cart Service - Publishing messages/events
     - Recall that we send messages/events to other components in our application
     - Using different Subject
       - ReplaySubject: 
         - keep a buffer of previous events, 
         - once subscribed, subscriber receives a replay of all previous events
       - Subject: 
         - Does not keep a buffer of previous events, 
         - subscriber only receives new events after they are subscribed
       - BehaviorSubject: 
         - has a buffer of the last event, 
         - once subscribed, subscriber receives the latest event sent prior to subscribing
   - Development Process
      1. Updates for checkoutComponent
         1. Inject CartService into CheckoutComponent
         2. In ngOnit method, call new method: reviewCartDetaisl()
         3. Add code for new method to subscribe cartService
      2. Update for CartService
         1. Change Subject to BehaviorSubject
          ```JavaScript
            totalPrice: Subject<number> = new BehaviorSubject<number>(0);
            totalQuantity:  Subject<number> = new BehaviorSubject<number>(0);
          ```