# Scalor - You personal grocery price tracker

## Project Introduction

Scalor is a mobile application designed to help users track and compare grocery prices across different stores.

By leveraging OCR and AI, Scalor allows users to easily record prices by snapping photos of price tags, eliminating manual data entry. With features like smart price comparisons, price history tracking, and personalized shopping lists, Scalor helps users make smarter shopping decisions and avoid overpaying by providing data-driven insights. Say goodbye to impulsive purchases and hello to smarter grocery shopping!


### Target Users
- Frequent home cooks & fresh food shoppers – People who regularly cook at home and need to purchase fresh groceries often.
- Price-conscious shoppers – Those who actively look for ways to save money on daily grocery shopping and avoid unnecessary spending.

## Tech Stack

### Front End

- Frontend Framework: React Native with Expo
  - Navigation: React Navigation
- Language: TypeScript

### Device Features & Maps

- Camera:
- Location & Maps:
- Notifications:

### Backend & Database
- Authentication: Firebase Authentication
- Database: Firebase Cloud Firestore
- Storage: Amzon AWS S3

### External APIs

- OCR API:
- AI Recognization API:

## Data Model 

1. users (collection)
	- id
	- name
	- email
	- phone_number
	- location
		- country
		- province
		- city
		- street_address
		- postcode
		- coordinates
			- latitude
			- longitude
	- preferred_unit
		- weight
		- volume
	- preferred_currency
	- created_at
	- updated_at
1. user_products (sub-collection)
    - id
    - product_id (reference to products collection)
    - created_at
    - updated_at
	    - customized_products (sub-collection)
	        - id
	        - name
	        - category
	        - image_url
	        - plu_code
	        - barcode
	        - created_at
	        - updated_at
	        - shopping_lists (sub-collection)
	            - list_id
	            - product_id
	            - product_name
	            - status
	            - created_at
	            - updated_at
	        - price_records (sub-collection)
	            - id
	            - user_product_id (references user_products)
	            - store_id (references stores)
	            - price
	            - unit_type
	            - unit_price
	            - photo_url
	            - recorded_at
	        - user_product_stats (sub-collection)
	            - id
	            - product_id (reference to products collection)
	            - currency
	            - total_price
	            - average_price
	            - lowest_price
	            - highest_price
	            - lowest_price_store
	                - store_id
	                - store_name
	            - total_price_records
	            - last_updated
	        - user_stores (sub-collection)
	            - id
	            - brand_id (references store_brands collection)
	            - name
	            - address
	            - location
	                - latitude
	                - longitude
	            - is_favorite
	            - last_visited
	            - created_at
	            - updated_at


2. products (collection)
	- id
	- name
	- category
	- image_type    // "emoji" | "image"
	- image_source  // emoji string or image url
	- plu_code
	- barcode

3. store_brands (collection)
	- id
	- name
	- logo
	- updated_at

4. shopping_list (collection)
    - id
    - name
    - items
    - shoppingTime
    - location
        - name
        - address
        - latitude
        - longitude
    - userid
    - shopping_list_item (subcollection)
        - id
        - name
        - quantity
        - checked


	  

## CRUD Operations on Collections

1. users (collection): Stores user profiles and preferences.
- [ ] Create: New users register an account via Firebase Authentication.
- [ ] Read: Users retrieve their profile details, preferred stores, and settings.
- [ ] Update: Users update their profile information, preferred units, and favorite stores.
- [ ] Delete: Users can delete their accounts, which also removes all their related sub-collections.

Sub-Collections under users: 

1.1 user_products (Sub-collection): Stores references to products that users have tracked.
- [x] Create: Automatically created when users add a price record for a product.
- [x] Read: Used internally to link users with products they track.
- [ ] Update: Updated when users interact with the product.
- [ ] Delete: Users can remove products they no longer want to track.

1.2 customized_products (Sub-collection): Stores user-defined products not present in the main product database.
- [ ] Create: Users manually add new custom products.
- [ ] Read: Users retrieve a list of their customized products.
- [ ] Update: Users can modify product details such as name, category, and image.
- [ ] Delete: Users can remove unwanted customized products.

1.3 shopping_lists (sub-collection)
- [x] Create: Users create new shopping lists and add products.
- [x] Read: Users retrieve their shopping lists and associated products.
- [x] Update: Users can mark items as purchased in each of shopping lists.
- [x] Delete: Users can delete entire shopping lists.

1.4 price_records (Sub-collection): Stores individual price entries for products.
- [x] Create: Users add price records manually or via OCR from price tags.
- [x] Read: Users retrieve product price history and price trends.
- [x] Update: Users can edit incorrect prices or store information.
- [x] Delete: Users can remove outdated or incorrect price records.

1.5 user_product_stats (Sub-collection): Stores aggregated statistics for each product a user tracks.
- [x] Create: Automatically generated when a user adds their first price record for a product.
- [x] Read: Users view statistics like average price, lowest price, etc.
- [x] Update: Automatically updated when new price records are added.
- [x] Delete: Removed when a user deletes the associated product from their tracking.

1.6 user_stores (Sub-collection): Stores information about stores that users have visited or added.
- [x] Create: Users can add new stores manually or when adding price records.
- [x] Read: Users can view their list of stores and details about each store.
- [x] Update: Users can update store information or mark stores as favorites.
- [x] Delete: Users can remove stores they no longer visit.

2. products (collection): Global product database.
- Create: Only Admins can add new product entries.
- [x] Read: Users can browse/search for products by name, code, or category.
- Update: Only Admins can update product names, categories, or images.
- Delete: Only Admins can remove outdated or incorrect products.

1. store_brands (collection): Stores information about retail brands.
- Create: Only Admins can add new store brands.
- [x] Read: Users can view store brand information.
- Update: Only Admins can update store brand details.
- Delete: Only Admins can remove outdated or incorrect store brands.
 
## Contributors

- [Shiyu Xu (Gina)](https://github.com/your-github)
	- UI Development
		- Designed and implemented core screens: ProductDetail, StoreDetail, RecordDetail, AddRecord, AddStore, Setting, EditProfile, and Home screens
		- Created reusable components including BackButton and MainPageHeader
		- Set up navigation flows between screens
	- Data Architecture
		- Designed the Firebase database schema and collection structure
		- Created TypeScript type definitions for the entire application
	- Firebase Integration
		- Implemented CRUD operations for price records, user products, and user stores
		- Set up real-time data synchronization between UI and Firebase

- [Yuxin Zhou (Renie)](https://github.com/Zhouyuxin4)
	- Firebase Integration
		- Implemented Firebase Helper (CRUD functions)
		- Integrated frontend with backend for Shopping List CRUD
	- UI Development
		- Developed UI for Shopping List (ShoppingList, AddShoppingList, ShoppingListDetails)
		- Implemented navigation between ShoppingList
		- Designed and developed a reusable Map component for location-based features
		- Integrated Google Maps API to enable user location detection and automatic search of nearby stores
		- Implemented SupermarketMapScreen where users can view and select stores on the map
		- Enabled storing selected store data in the Firebase database for later use
	- Notification System
		- Set up a notification feature to remind users to shop on their chosen shopping date
		- Allowed users to toggle notifications on or off within the app's settings


## Application Screenshots

### Shopping List Features

<table>
<tr>
<td width="33%"><img src="https://github.com/user-attachments/assets/97ff3563-a1cd-4ee8-9a29-5d2604880893" alt="Shopping Lists Screen" width="100%"/><br><em>Shopping Lists (Android)</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/c12b108f-9c1e-402d-87c4-50809107de42" alt="Shopping List Details" width="100%"/><br><em>Shopping List Details (Android)</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/e9cf584b-cf59-43cf-8c14-0822ecf57b8b" alt="Add Shopping List" width="100%"/><br><em>Add Shopping List (iOS)</em></td>
</tr>
</table>

### Products and Price Records

<table>
<tr>
<td width="33%"><img src="https://github.com/user-attachments/assets/6f570aa2-1dc7-4c7b-8c3e-a12283276cde" alt="Product Details" width="100%"/><br><em>All Product</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/fa2926be-f2d1-4cf3-9906-c6e9b432a89b" alt="Price Record" width="100%"/><br><em>Product Detail</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/d84eae06-938b-4815-880f-f894aa9fb1b0" alt="Add Record" width="100%"/><br><em>Record Detail</em></td>
</tr>
</table>

<table>
<tr>
<td width="50%"><img src="https://github.com/user-attachments/assets/627d1454-6416-47ad-94af-82c3d6571067" alt="Product Details" width="100%"/><br><em>Add Record</em></td>
<td width="50%"><img src="https://github.com/user-attachments/assets/f3f1845c-1bb7-47c5-822a-1d42b0169655" alt="Price Record" width="100%"/><br><em>Product Library</em></td>
</tr>
</table>

### Stores and Settings

<table>
<tr>
<td width="33%"><img src="https://github.com/user-attachments/assets/0b723089-569d-4f5c-bc7c-dbb0a82c879a" alt="Store List" width="100%"/><br><em>Store List</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/2e946bac-04f0-4aa8-b897-6d960fb5de1a" alt="Store Details" width="100%"/><br><em>Add Store</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/1d261652-40b9-4f01-aac9-f4a894537e87" alt="Product Library" width="100%"/><br><em>Store Details</em></td>
</tr>
</table>

### Setttings

<table>
<tr>
<td width="50%"><img src="https://github.com/user-attachments/assets/9506f5fd-d455-4d61-b76b-48769e9010f0" alt="Add Store" width="100%"/><br><em>Settings</em></td>
<td width="50%"><img src="https://github.com/user-attachments/assets/2dc4b062-9425-4cf4-b2a7-0b8d9fa433b1" alt="Home Screen" width="100%"/><br><em>Edit Profile</em></td>
</tr>
</table>

## Development Guide

### Setup
1. Clone the repository
2. Install dependencies: `npm install` or `yarn install`
3. Create a `.env` file in the root directory with the required environment variables
4. Start the development server: `npm start` or `yarn start`
