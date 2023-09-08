# Driven Pass

DrivenPass is a password manager designed to securely store and manage your passwords. Built with NestJS and Prisma, it ensures that your passwords are encrypted and safely stored, allowing you to access them whenever needed.

## About

DrivenPass Nest is a secure password manager that helps users keep track of their passwords in one centralized location. With the increasing number of online accounts and services we use daily, remembering every password becomes a challenge. DrivenPass provides a solution by storing all passwords securely, ensuring that users only need to remember one master password. The project uses advanced encryption techniques to guarantee the security of stored data.

**Features:**
- Secure storage of passwords.
- Enhanced API documentation across all routes.
- Integration with Prisma for database operations.
- End-to-end integration tests to ensure application reliability.

**Upcoming Features / Next Steps:**
- [List of features that are planned for future development]

## Technologies

- **NestJS**
- **TypeScript**
- **Prisma**
- **bcrypt**
- **faker**
- **dotenv**
- **jest**

## How to Run

1. **Clone the Repository**:
```bash
git clone https://github.com/expeditus303/drivenpass-nest.git
```

2. **Setup Environment Variables**:
Create a `.env` file in the root directory and add the following: 
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/database?schema=public"
SECRET_KEY="YOUR_SECRET_KEY"
JWT_SECRET_KEY="YOUR_JWT_SECRET_KEY"
ENCRYPTION_SECRET_KEY="YOUR_ENCRYPTION_SECRET_KEY"
```

3. **Install Dependencies**:
```javascript
npm install
````



