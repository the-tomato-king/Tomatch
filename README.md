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
- Storage: 

### External APIs

- OCR API:
- AI Recognization API:

## Data Model 

1. users (collection)
	- user_id
	- name
	- email
	- phone_number
	- location
		- city
		- country
		- postcode
		- coordinates
			- latitude
			- longitude
	- preferred_unit
		- weight
		- volume
	- created_at
	- updated_at
	- currency
	- favorites_stores
	2. customized_products (sub-collection)
		- product_id
		- name
		- category
		- image_url
		- plu_code
		- barcode
		- created_at
		- updated_at
	3. shopping_lists (sub-collection)
		- list_id
		- product_id
		- product_name
		- status
		- created_at
		- updated_at
	4. price_records (sub-collection)
		- record_id
		- product_id  // references products
		- store_id    // references stores
		- price
			- amount
			- currency
		- unit_type
		- photo_url
		- recorded_at

5. products (collection)
	- product_id
	- name
	- category
	- image_url
	- plu_code
	- barcode

6. stores (collection)
	- store_id
	- name
	- logo_url
	- address
	- location
	- inactive
	- created_at
	- updated_at

## CRUD Operations on Collections

1. users (collection): Stores user profiles and preferences.
- [ ] Create: New users register an account via Firebase Authentication.
- [ ] Read: Users retrieve their profile details, preferred stores, and settings.
- [ ] Update: Users update their profile information, preferred units, and favorite stores.
- [ ] Delete: Users can delete their accounts, which also removes all their related sub-collections.

Sub-Collections under users: 

1.1 customized_products (Sub-collection): Stores user-defined products not present in the main product database.
- [ ] Create: Users manually add new custom products.
- [ ] Read: Users retrieve a list of their customized products.
- [ ] Update: Users can modify product details such as name, category, and image.
- [ ] Delete: Users can remove unwanted customized products.


1.2 shoppinglists
- [ ] Create: Users create new shopping lists and add products.
- [ ] Read: Users retrieve their shopping lists and associated products.
- [ ] Update: Users can rename shopping lists, modify items, and mark items as purchased.
- [ ] Delete: Users can delete entire shopping lists or remove individual products from a list.

1.3 price_records
- [ ] Create: Users add price records manually or via OCR from price tags.
- [ ] Read: Users retrieve product price history and price trends.
- [ ] Update: Users can edit incorrect prices or store information.
- [ ] Delete: Users can remove outdated or incorrect price records.

2. products (collection)
- [ ] Create: Only Admins can add new product entries.
- [ ] Read: Users can browse/search for products by name, code, or category.
- [ ] Update:  Only Admins can update product names, categories, or images.
- [ ] Delete: Only Admins can remove outdated or incorrect products.

3. stores (collection)
- [ ] Create: New stores can be added manually or via an API (e.g., Google Places).
- [ ] Read: Users can view store details
- [ ] Update: Store information can be updated (e.g., address, name change).
- [ ] Delete: Stores can be removed if the user don't need them.
	- Soft Delete (Default)
		- The store is marked as "archived" (inactive) but remains in the database.
		- Users can choose whether price records remain accessible.
	- User Confirm: Full Deletion (Cascade Delete): If confirmed, the store and all linked price records will be permanently deleted.
