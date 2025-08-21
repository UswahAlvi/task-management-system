
### **Build a Multi-Company Task Management System**

#### **Overview**
We are building a **Task Management System** where users can belong to multiple companies and manage projects within those companies. Each company can have multiple projects, which are further organized into task lists. Users can assign and track todos, and comment on tasks.

---

### **📌 Features & Requirements**

#### **1️⃣ User Management**
- Users can **own** multiple companies.
- Users can **join** multiple companies.
- Role-based access control (e.g., **Owner, Admin, Viewer, Editor**).
- Authentication using **JWT + Refresh Tokens**.

#### **2️⃣ Company Management**
- A user can **create a company** and invite others.
- Companies have **multiple users** and **multiple projects**.
- Owners/Admins can **add/remove users** from the company.

#### **3️⃣ Project Management**
- Each company can have **multiple projects**.
- Users **assigned as editor to a project** can view and manage it.
- Users **assigned as viewer to a project** can view it.
- Projects contain **multiple task lists**.

#### **4️⃣ Task List & Todo Management**
- Projects are organized into **task lists**.
- Each task list contains multiple **todos**.
- **Todos can be assigned** to any user within the company.
- Todos have **statuses** (e.g., Pending, In Progress, Completed).
- Todos support **due dates and priority levels**.
- Users can **comment on todos** if they have project access.
---