# stelis-dnd

Stelis DnD is a campaign and character management system for Dungeons & Dragons. The application provides tools for creating and managing campaigns, characters, items, and inventories. Additionally, it supports downtime management for each character. This app is designed with both admins and regular users in mind, ensuring a smooth experience for both roles.

Live application can be accessed at the following link:\
https://stelis-dnd.mbn2576gvvvc8.eu-central-1.cs.amazonlightsail.com/

## Features

### 1. Authentication and Authorization

- Users can sign up and log in using JWT-based authentication.
- Admin and regular user roles:
  - **Admins** have full control over the system.
  - **Users** can interact with campaigns, characters, and items they are assigned to.

### 2. Campaign Management

- **Admin** can create and manage campaigns.
- Regular users can only access campaigns in which they have at least one character. The admin must first assign a character to a user within a campaign before they can access it.

### 3. Character Management

- **Admin** can create characters for themselves or assign characters to any user within a specific campaign.
- Users can create additional characters in campaigns where they already have at least one character.

### 4. Item Management and Shop System

- **Admin** can create items and manage the item shop.
- When items are added by the admin, they appear in the shop where any character can purchase them.
  - Items can be flagged as **unique**, meaning they will only appear in the shop of a specific campaign.
  - Characters can purchase multiple quantities of an item, and the items are added to the character's inventory.
  - Characters can sell multiple quantities of an item, and the items are removed character's inventory.
- **Transaction Log**: Each item purchased or sold appears in a dedicated transactions tab for the character.

### 5. Downtime Management

- Characters have a downtime value that they can freely modify.
- **Downtime Events**:
  - Downtime can be spent on various activities (e.g., research, training, etc.) over a number of in-game days.
  - The downtime events are tracked in a separate tab, similar to transactions.

## Getting started

1. Clone the repository:

   ```bash
   git clone git@github.com:Inokus/stelis-dnd.git
   cd stelis-dnd
   ```

2. Install dependencies:

   ```bash
   # Back-end
   cd server/
   npm install

   # Front-end
   cd client/
   npm install
   ```

3. Configure environment variables:

   Both server and client has `.env.example` files, change file names to `.env` and adjust back-end database variables as needed.

4. Migrate database:

   ```bash
   cd server/
   npm run migrate:latest
   ```

5. Run the application:

   ```bash
   # For application to work properly both server and client needs to be running at the same time
   cd server/
   npm run dev

   cd client/
   npm run dev
   ```

   After starting front-end dev server message should inform about url that it's accessable at. If `5173` port is not used by other applications it should be http://localhost:5173/ by default.

Important note. Having regular user and admin roles complicates testing application as by default regular user wouldn't be able to interract with application much. For safety reasons there's no easy way to grant user admin privileges, but there are a few ways to do it:

1. Change `isAdmin` field from `false` to `true` directly in the database.
2. In `server/src/controllers/users/signup.ts` add new line after line 29: `isAdmin: true`.
3. In `server/src/controllers/users/signup.ts` after line 53, but before return statement add: `await repos.usersRepository.makeAdmin(userCreated.id)`.
4. Use [tRPC procedures](#trpc-procedures) to signup, copy userId from response and use makeAdmin with copied userId.

Second and third approach would cause all newly created users to be admins. Third and fourth approaches will only work in testing and development environments.

## Testing

### Back-end

```bash
    cd server/

    # For unit tests
    npm run test

    # For test coverage
    npm run coverage
```

### Front-end

```bash
    cd client/

    # For unit tests
    npm run test:unit

    # For end-to-end tests
    npm run test:e2e
```

## tRPC procedures

Not all functionality is currently implemented in front-end but these tRPC procedures can still be used.

1. Open http://localhost:3000/api/v1/trpc-panel in browser.
2. If user is already created and logged in copy token value from front-end local storage, if not you can use signup/login procedures in tRPC panel. Login should respond with access token that can then be attached to tRPC panel header (top right).
   It should look something like this: `key: Authorization` `value: Bearer your_access_token`

### Routes

#### users

##### signup

- Description: Creates a new user and returns their id.
- Input: `username (string)`, `email (string)`, `password (string)`

##### login

- Description: Authenticate the user and on success return access token.
- Input: `username (string)`, `password (string)`

##### getAll

Admin only

- Description: Gets all users.
- Input: none

##### makeAdmin

Test and development only

- Description: Gives user admin privileges.
- Input: `userId (number)`

#### campaigns

##### create

Admin only

- Description: Creates a new campaign and returns its data.
- Input: `name (string)`

##### getAvailable

- Description: Gets all campaigns available to the user, campaign is considered available if user has at least one character in it. Admin has access to all campaigns.
- Input: none

#### characters

##### create

- Description: Creates a new character in specified campaign.
- Input: `name (string)`, `campaignId (number)`, `userId (number) - optional, meant for admins who wants to create characters for other users`

##### getAvailable

- Description: Gets all characters available to the user. Admin has access to all characters.
- Input: `campaignId (number)`

##### update

- Description: Updates character, currently only downtime property is allowed to be updated.
- Input: `characterId (number)`, `downtime (number)`

##### getInventory

- Description: Gets all items in characters possession.
- Input: `characterId (number)`

##### getDowntimes

- Description: Gets all downtimes associated with the character.
- Input: `characterId (number)`

##### getTransactions

- Description: Gets all transactions associated with the character.
- Input: `characterId (number)`

##### createDowntime

- Description: Creates new downtime entry for a character, days specified are subtracted from said characters downtime property.
- Input: `type (string)`, `days (number)`, `description (string)`, `characterId (number)`

##### createTransaction

- Description: Creates new transaction entry for a character, depending on transaction type item specified is either added or removed from characters inventory.
- Input: `type (string)`, `quantity (number)`, `characterId (number)`, `itemId (number)`

#### items

##### create

Admin only

- Description: Creates a new item. If campaignId is specified that item will not be accessible in other campaigns.
- Input: `name (string)`, `description (string)`, `value (number)`, `isCurrency (boolean)`, `campaignId (number) - optional`

##### getAvailable

- Description: Gets all items available in specified campaign.
- Input: `campaignId`

##### update

Admin only

- Description: Updates an item.
- Input: `itemId (number)`, `name (string)`, `description (string)`, `value (number)`

##### remove

Admin only

- Description: Removes an item.
- Input: `itemId (number)`
