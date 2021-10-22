# eCommerce
# Release 2.0

- [x] Online Shop Template Integration
- [x] Search for products by category
  - [x] hard code category
  - [x] dynamic read categories form database
- [x] Search for products by text box 
- [x] Master/Detail view of products
- [ ] Pagination support for products
- [ ] Add products to shopping cart(CRUD)
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
## Add products to shopping cart(CRUD)
## Shopping cart check out