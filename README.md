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
	- preferred_unit
		- weight
		- volume
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
	- created_at
	- updated_at
