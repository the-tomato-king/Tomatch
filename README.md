<div align="center">
  <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
    <img src="https://picture-guan.oss-cn-hangzhou.aliyuncs.com/F4C32040-60EC-4415-9348-39CA98680520.png" width="100" alt="Tomatch Logo">
    <div>
      <h1 style="margin: 0;">Tomatch</h1>
      <p style="margin: 0;">To Match, To Save, Your personal grocery price tracker</p>
    </div>
  </div>
  
</div>

<br>
Tomatch is a mobile application designed to help users track and compare grocery prices across different stores.

By leveraging AI, Tomatch allows users to easily record prices by snapping photos of price tags, eliminating manual data entry. With features like smart price comparisons, price history tracking, and personalized shopping lists, Tomatch helps users make smarter shopping decisions and avoid overpaying by providing data-driven insights. Say goodbye to impulsive purchases and hello to smarter grocery shopping!


### Target Users
- Frequent home cooks & fresh food shoppers – People who regularly cook at home and need to purchase fresh groceries often.
- Price-conscious shoppers – Those who actively look for ways to save money on daily grocery shopping and avoid unnecessary spending.

## Tech Stack

### Front End

- Frontend Framework: React Native with Expo
  - Navigation: React Navigation
- Language: TypeScript

### Device Features & Maps

- Camera: expo-image-picker
- Location & Maps: react-native-maps && Google Map API
- Notifications: expo-notifications

### Backend & Database
- Authentication: Firebase Authentication
- Database: Firebase Cloud Firestore
- Storage: Firebase Storage

### External APIs

- OpenAI API:
  - Model: gpt-4o-mini
  - Purpose: Price tag image analysis and text recognition
  - Features:
    - Extracts product name, price, and unit information from images
    - Standardizes product names by removing marketing terms
    - Normalizes units to standard measurements (g, kg, lb, oz, ml, L, EA)

- Google Maps API:
  - Services Used: 
    - Places API (Nearby Search)
    - Geolocation
  - Features:
    - User location detection with permission handling
    - Nearby supermarket search within 5km radius
    - Store details including name, address, and coordinates
    - Location data persistence using AsyncStorage

## Data Model 

### 1. users (collection)
- id
- name
- email
- phone_number
- location
  - country
  - province
  - city
- preferred_unit
- preferred_currency
- avatar_url
- created_at
- updated_at

#### 1.1 user_products (sub-collection)
- id
- product_id (optional, references local product library)
- name (product name, copied from product library or user-defined)
- category
- image_type ("emoji" | "preset_image" | "user_image")
- image_source (emoji string or image url)
- plu_code
- barcode
- measurement_types (array of "measurable" and/or "count")
- price_statistics
  - measurable (optional)
    - total_price
    - average_price
    - lowest_price
    - highest_price
    - lowest_price_store
      - store_id
      - store_name
    - total_price_records
  - count (optional, same structure as measurable)
- display_preference ("measurable" | "count" | undefined)
- created_at
- updated_at

#### 1.2 user_stores (sub-collection)
- id
- brand_id (references store_brands)
- name (e.g., "Walmart Downtown", "Walmart West Side")
- address
- location
  - latitude
  - longitude
- is_favorite
- last_visited
- created_at
- updated_at
- is_inactive

#### 1.3 shopping_lists (sub-collection)
- id
- product_id
- product_name
- status
- created_at
- updated_at

#### 1.4 price_records (sub-collection)
- id
- user_product_id (references user_products)
- store_id (references user_stores)
- original_price
- original_quantity
- original_unit
- standard_unit_price (price per standard unit - g or each)
- photo_url
- recorded_at

### 2. Local Store Brands Library (in-app, not in Firestore)
- id
- name
- logo

### 3. Local Product Library (in-app, not in Firestore)
- id
- name
- category
- image_type ("emoji" | "preset_image" | "user_image")
- image_source (emoji string or image url)
- plu_code
- barcode

## CRUD Operations on Collections

1. users (collection): Stores user profiles and preferences.
- [x] Create: New users register an account via Firebase Authentication.
- [x] Read: Users retrieve their profile details, preferred stores, and settings.
- [x] Update: Users update their profile information, preferred units, and favorite stores.
- [x] Delete: Users can delete their accounts, which also removes all their related sub-collections.

Sub-Collections under users: 

1.1 user_products (Sub-collection): Stores products that users have tracked, including both local product references and custom products.
- [x] Create: Users add products from the local library or create custom products.
- [x] Read: Users retrieve their tracked products.
- [x] Update: Users can modify product details or update tracking information.
- [x] Delete: Users can remove products they no longer want to track.

1.2 shopping_lists (sub-collection): Manages user's shopping list items.
- [x] Create: Users create new shopping lists and add products.
- [x] Read: Users retrieve their shopping lists and associated products.
- [x] Update: Users can mark items as purchased in each shopping list.
- [x] Delete: Users can delete entire shopping lists or individual items.

1.3 price_records (Sub-collection): Stores individual price entries for products.
- [x] Create: Users add price records manually or via OCR from price tags.
- [x] Read: Users retrieve product price history and price trends.
- [x] Update: Users can edit incorrect prices or store information.
- [x] Delete: Users can remove outdated or incorrect price records.

1.4 user_stores (Sub-collection): Stores information about stores that users have visited or added.
- [x] Create: Users can add new stores manually or when adding price records.
- [x] Read: Users can view their list of stores and details about each store.
- [x] Update: Users can update store information or mark stores as favorites.
- [x] Delete: Users can remove stores they no longer visit.


## Contributors

### [Shiyu Xu (Gina)](https://github.com/Gnblink0)

- Data Architecture & Schema Design
	- Created TypeScript type definitions for the entire application
	- Designed and Optimized database schema for better data organization
	- Developed dual pricing system (count & measurable) with dynamic switching

- Firebase Integration & Services
	- Restructured Firebase functions into modular services
	- Implemented CRUD operations for user products and price records
	- Developed user profile and preferences management system
	- Added email verification functionality
	- Set up real-time data synchronization between UI and Firebase

- Core Features Development
    - AI-Powered Price Tag Recognition System
        - Implemented image extraction using OpenAI API
        - Optimized GPT prompts for accurate product name, price, and unit recognition
    
    - Comprehensive Price Management System
        - Developed dual pricing system (count & measurable units)
        - Implemented automatic unit conversion (kg/lb, ml/oz, etc.)
        - Created standardized price display with user's preferred units


- UI Development
	- Designed and implemented core screens in products, setting, stores folders
	- Created reusable components including BackButton, MainPageHeader, AILoadingScreen, LoadingLogo, and ProductSearchInput
	- Set up navigation flows between screens


### [Yuxin Zhou (Renie)](https://github.com/Zhouyuxin4)


- Firebase Integration
	- Implemented Firebase Helper (CRUD functions)
	- Integrated frontend with backend for Shopping List CRUD
- Shopping List Development
	- Developed UI for Shopping List (ShoppingList, AddShoppingList, ShoppingListDetails)
	- Implemented navigation between ShoppingList
- Map and Stores Select
	- Designed and developed a reusable Map component for location-based features
	- Integrated Google Maps API to enable user location detection and automatic search of nearby stores
	- Implemented SupermarketMapScreen where users can view and select stores on the map
	- Enabled storing selected store data in the Firebase database for later use
- Notification System
	- Set up a notification feature to remind users to shop on their chosen shopping date
	- Allowed users to toggle notifications on or off within the app's settings
- Authentication
	- Developed the login screen, signup screen, password reset and forget password screen
    - Implemented user registration, login, logout, password reset, and account deletion using Firebase Authentication
	- Restricted data access so each user only sees users own shopping lists and details (auth-based access control)
	- Developed and integrated onboarding screen shown only on the app's first launch
- Google Maps API
	- Integrated Google Maps to allow users to search and view nearby stores based on their current location
	- Fetched detailed store information (e.g., name, address) and show the information
	- Enable selecting a store from the list highlights it on the map, and tapping a marker on the map scrolls to its entry in the list.
- UI Modification
	- Enhanced UI with custom icons and improved visual styling for a more user-friendly experience
	- Added images and icon overlays to improve usability and aesthetics

## Update

### Iteration 1

#### Shopping List Features

<table>
<tr>
<td width="33%"><img src="https://github.com/user-attachments/assets/97ff3563-a1cd-4ee8-9a29-5d2604880893" alt="Shopping Lists Screen" width="100%"/><br><em>Shopping Lists (Android)</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/c12b108f-9c1e-402d-87c4-50809107de42" alt="Shopping List Details" width="100%"/><br><em>Shopping List Details (Android)</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/d57fdc59-d2de-491d-a5f9-64456c578055" alt="Add Shopping List" width="100%"/><br><em>Add Shopping List (iOS)</em></td>
</tr>
</table>


#### Products and Price Records

<table>
<tr>
<td width="33%"><img src="https://github.com/user-attachments/assets/5da5d4ed-e5c9-493c-90e4-7f21f0335097" alt="Product Details" width="100%"/><br><em>All Product</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/801995ad-41db-455c-b782-f7907f22601a" alt="Price Record" width="100%"/><br><em>Product Detail</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/aff27682-ac74-412e-bf3c-7bbc6ecefde0" alt="Add Record" width="100%"/><br><em>Record Detail</em></td>
</tr>
</table>

<table>
<tr>
<td width="50%"><img src="https://github.com/user-attachments/assets/6d467050-cd60-4744-886f-bdd079380d77" alt="Product Details" width="100%"/><br><em>Add Record</em></td>
<td width="50%"><img src="https://github.com/user-attachments/assets/4e851138-d7cc-437b-988e-4c2e16ae7573" alt="Price Record" width="100%"/><br><em>Product Library</em></td>
</tr>
</table>


#### Setttings

<table>
<tr>
<td width="50%"><img src="https://github.com/user-attachments/assets/a68e0b02-8366-4a49-9cd8-18d68e2ee661" width="100%"/><br><em>Settings</em></td>
<td width="50%"><img src="https://github.com/user-attachments/assets/2dc4b062-9425-4cf4-b2a7-0b8d9fa433b1" width="100%"/><br><em>Edit Profile</em></td>
</tr>
</table>

### Iteration 2

#### Camera

- Implemented using expo-image-picker
- Users can snap a photo or choose from library
- Photo preview and retake functionality


<table>
<tr>
<td width="33%"><img src="https://github.com/user-attachments/assets/3f32d464-93d8-4b46-9857-182c303b15fe" width="100%"/><br><em>Click to take photo</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/9512e801-ffa4-4db6-a6c7-3c3d1e87e303" width="100%"/><br><em>Camera</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/e6bca368-34cc-4e08-bbc3-6a06e22b304d" width="100%"/><br><em>Library</em></td>
</tr>
</table>

#### OpenAI API

- OpenAI API: Implemented for price tag text recognition

<table>
<tr>
<td width="50%"><img src="https://github.com/user-attachments/assets/38250257-41ff-41d9-80c0-0638c35f7d30" width="100%"/><br><em>AI is Analyzing</em></td>
<td width="50%"><img src="https://github.com/user-attachments/assets/cb95cd44-3428-420c-ab02-49a78a00004f" alt="Set Location" width="100%"/><br><em>AI Auto Fill</em></td>
</tr>
</table>

#### Location

- Store location detection and mapping
- User location-based store suggestions

<table>
<tr>
<td width="50%"><img src="https://github.com/user-attachments/assets/906dc139-2701-47af-92e7-f889f54ef8a7" alt="Set Notification" width="100%"/><br><em>Store Screen with Location Selector and Draggable Panel</em></td>
<td width="50%"><img src="https://github.com/user-attachments/assets/0b095b5d-bf6d-465a-a498-7a1c28e8f5e8" width="100%"/><br><em>Select Store in Shopping List</em></td>
</tr>
</table>

### Iteration 3

#### Authentication

- Users can register and log in using email and password. Authentication state is persisted across sessions.

- Users can update personal info, change password, and upload an avatar using the camera or gallery.

- Users can reset their password via a recovery email if they forget it.

- Users can log out or permanently delete their account along with associated data and avatar.

- Each user only has access to their own data based on authentication.

- First-time users are guided through a one-time onboarding screen.

<table>
<tr>
<td width="33%"><img src="https://github.com/user-attachments/assets/dc16d1ce-3119-4ddc-8450-3566f20dd921" alt="Onboarding Screen" width="100%"/><br><em>Onboarding Screen (iOS)</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/25285376-5620-478c-a78b-0d1394601f46" alt="Login Screen" width="100%"/><br><em>Login Screen (Android)</em></td>
<td width="33%"><img src="https://github.com/user-attachments/assets/f1f756e0-9343-4428-9337-f1c7adf87845" alt="Settings Screen" width="100%"/><br><em>Settings Screen (Android)</em></td>
</tr>
</table>

#### Push Notifications

- Shopping reminder notifications
- Customizable notification timing
- Platform-specific implementation (iOS/Android)

<table>
<tr>
<td width="50%"><img src="https://github.com/user-attachments/assets/b85ff64e-865f-4318-a789-43fda78c4c2c" alt="Set Notification" width="100%"/><br><em>Set Notification (iOS)</em></td>
<td width="50%"><img src="https://github.com/user-attachments/assets/d394bf81-acd7-46ca-a877-aebff78fc5d3" alt="Recieve Notification " width="100%"/><br><em>Recieve Notification (iOS)</em></td>
</tr>
</table>

#### Google Maps API

- App requests location access to enable nearby search and centering map on user's location.
- Users can search for nearby stores based on their current location using Google Maps Places API.
- When a store is selected on the map, detailed information is retrieved and displayed.
- Selecting a store from the list highlights it on the map, and tapping a marker on the map scrolls to its entry in the list.
<table>
<tr>
<td width="50%"><img src="https://github.com/user-attachments/assets/30d58192-4542-4c90-9cf8-8bf618c4f331" alt="Stores Screen" width="100%"/><br><em>Stores Screen (Android)</em></td>
<td width="50%"><img src="https://github.com/user-attachments/assets/71d779c5-ebb3-43de-a3f6-9424f7ab5a91" alt="Select Supermarket" width="100%"/><br><em>Select Supermarket (Android)</em></td>
</tr>
</table>


## Development Guide

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory with the required environment variables
4. Start the development server: `npm expo start`
