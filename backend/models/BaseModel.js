import db from '../config/firebase.js';
import bcrypt from 'bcryptjs';

class FirestoreQuery {
  constructor(fetchFn) {
    this.fetchFn = fetchFn;
    this.populateFields = [];
    this.selectFields = '';
    this.sortObj = null;
    this.limitVal = null;
    this.skipVal = null;
  }

  populate(field) {
    this.populateFields.push(field);
    return this;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  sort(sortObj) {
    this.sortObj = sortObj;
    return this;
  }

  limit(limitVal) {
    this.limitVal = limitVal;
    return this;
  }

  skip(skipVal) {
    this.skipVal = skipVal;
    return this;
  }

  async exec() {
    let results = await this.fetchFn();
    
    // In-memory Sorting
    if (this.sortObj && Array.isArray(results)) {
      const [key, direction] = Object.entries(this.sortObj)[0];
      results.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];
        
        // Handle dates or timestamps
        if (key === 'createdAt' || key === 'updatedAt') {
          valA = new Date(valA || 0).getTime();
          valB = new Date(valB || 0).getTime();
        }
        
        if (valA < valB) return direction === -1 || direction === 'desc' ? 1 : -1;
        if (valA > valB) return direction === -1 || direction === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // In-memory Skip & Limit
    if (Array.isArray(results)) {
      if (this.skipVal !== null) {
        results = results.slice(this.skipVal);
      }
      if (this.limitVal !== null) {
        results = results.slice(0, this.limitVal);
      }
    }

    // In-memory Population
    if (this.populateFields.length > 0) {
      if (Array.isArray(results)) {
        for (let i = 0; i < results.length; i++) {
          results[i] = await this._populateResult(results[i]);
        }
      } else if (results) {
        results = await this._populateResult(results);
      }
    }

    // In-memory Selection (Strip fields starting with '-')
    if (this.selectFields && typeof this.selectFields === 'string') {
      const stripList = this.selectFields.split(' ').filter(f => f.startsWith('-')).map(f => f.substring(1));
      if (Array.isArray(results)) {
        results.forEach(res => {
          stripList.forEach(key => delete res[key]);
        });
      } else if (results) {
        stripList.forEach(key => delete results[key]);
      }
    }

    return results;
  }

  async _populateResult(item) {
    if (!item) return item;
    
    for (const field of this.populateFields) {
      let path = field;
      let nestedPopulate = null;
      if (typeof field === 'object' && field !== null) {
        path = field.path;
        nestedPopulate = field.populate;
      }

      const refId = item[path];
      if (!refId) continue;

      let targetModel;
      if (path === 'teacher') {
        const { default: Teacher } = await import('./Teacher.js');
        targetModel = Teacher;
      } else if (path === 'student') {
        const { default: Student } = await import('./Student.js');
        targetModel = Student;
      } else if (path === 'user') {
        const { default: User } = await import('./User.js');
        targetModel = User;
      } else if (path === 'course') {
        const { default: Course } = await import('./Course.js');
        targetModel = Course;
      }
      
      if (targetModel) {
        // Handle if refId is object already or ID string
        const idStr = typeof refId === 'object' && refId._id ? refId._id : refId;
        if (typeof idStr === 'string') {
          let populated = await targetModel.findById(idStr);
          if (populated) {
            if (nestedPopulate) {
              const subQuery = new FirestoreQuery(() => Promise.resolve(populated));
              subQuery.populateFields = Array.isArray(nestedPopulate) ? nestedPopulate : [nestedPopulate];
              populated = await subQuery.exec();
            }
            item[path] = populated;
          }
        }
      }
    }
    return item;
  }

  then(onfulfilled, onrejected) {
    return this.exec().then(onfulfilled, onrejected);
  }

  catch(onrejected) {
    return this.exec().catch(onrejected);
  }
}

export class BaseModel {
  constructor(collectionName, prototype = {}) {
    this.collectionName = collectionName;
    this.prototype = prototype;
  }

  _mapDoc(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    
    // Create an instance that inherits from both prototype and this base class
    const instance = Object.create(this.prototype);
    Object.assign(instance, data, {
      _id: doc.id,
      id: doc.id,
      collectionName: this.collectionName,
      save: async function() {
        const docData = { ...this };
        const id = docData._id;
        delete docData._id;
        delete docData.id;
        delete docData.collectionName;
        delete docData.save;
        
        docData.updatedAt = new Date().toISOString();
        
        // Strip Mongoose IDs or populate elements to raw strings
        for (const [key, val] of Object.entries(docData)) {
          if (val && typeof val === 'object' && val._id) {
            docData[key] = val._id;
          }
        }
        
        // Auto-hash password on User instance save if it looks plain text
        if (this.collectionName === 'users' && docData.password && !docData.password.startsWith('$2a$') && !docData.password.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          docData.password = await bcrypt.hash(docData.password, salt);
        }

        await db.collection(this.collectionName).doc(id).set(docData);
        this.password = docData.password; // keep synced
        return this;
      }
    });
    return instance;
  }

  findById(id) {
    return new FirestoreQuery(async () => {
      if (!id || typeof id !== 'string') return null;
      const doc = await db.collection(this.collectionName).doc(id).get();
      return this._mapDoc(doc);
    });
  }

  findOne(query = {}) {
    return new FirestoreQuery(async () => {
      const results = await this.find(query);
      return results.length > 0 ? results[0] : null;
    });
  }

  find(query = {}) {
    return new FirestoreQuery(async () => {
      let ref = db.collection(this.collectionName);
      
      const snapshot = await ref.get();
      let docs = snapshot.docs.map(doc => {
        return { _id: doc.id, id: doc.id, ...doc.data() };
      });

      // Filter in-memory
      if (Object.keys(query).length > 0) {
        docs = docs.filter(doc => this._matchesQuery(doc, query));
      }

      // Map to instances
      return docs.map(doc => {
        const instance = Object.create(this.prototype);
        Object.assign(instance, doc, {
          collectionName: this.collectionName,
          save: async function() {
            const docData = { ...this };
            const id = docData._id;
            delete docData._id;
            delete docData.id;
            delete docData.collectionName;
            delete docData.save;
            
            docData.updatedAt = new Date().toISOString();

            // Strip Mongoose IDs or populate elements to raw strings
            for (const [key, val] of Object.entries(docData)) {
              if (val && typeof val === 'object' && val._id) {
                docData[key] = val._id;
              }
            }

            if (this.collectionName === 'users' && docData.password && !docData.password.startsWith('$2a$') && !docData.password.startsWith('$2b$')) {
              const salt = await bcrypt.genSalt(10);
              docData.password = await bcrypt.hash(docData.password, salt);
            }

            await db.collection(this.collectionName).doc(id).set(docData);
            this.password = docData.password;
            return this;
          }
        });
        return instance;
      });
    });
  }

  _matchesQuery(doc, query) {
    for (const [key, value] of Object.entries(query)) {
      if (key === '$or' && Array.isArray(value)) {
        const matchAny = value.some(subQuery => this._matchesQuery(doc, subQuery));
        if (!matchAny) return false;
      } else if (key === '$and' && Array.isArray(value)) {
        const matchAll = value.every(subQuery => this._matchesQuery(doc, subQuery));
        if (!matchAll) return false;
      } else if (typeof value === 'object' && value !== null) {
        // Operators check
        for (const [op, opVal] of Object.entries(value)) {
          if (op === '$in' && Array.isArray(opVal)) {
            const docVal = doc[key]?._id || doc[key];
            if (!opVal.includes(docVal)) return false;
          } else if (op === '$ne') {
            const docVal = doc[key]?._id || doc[key];
            if (docVal === opVal) return false;
          } else if (op === '$gt') {
            if (!(doc[key] > opVal)) return false;
          } else if (op === '$lt') {
            if (!(doc[key] < opVal)) return false;
          }
        }
      } else {
        // Simple equality check
        // Handle Mongoose ObjectID strings matching objects or string keys
        const docVal = doc[key]?._id || doc[key];
        const matchVal = value?._id || value;
        if (docVal !== matchVal) return false;
      }
    }
    return true;
  }

  async create(data) {
    const docData = { ...data };
    
    // Strip Mongoose IDs or populate elements to raw strings
    for (const [key, val] of Object.entries(docData)) {
      if (val && typeof val === 'object' && val._id) {
        docData[key] = val._id;
      }
    }

    docData.createdAt = new Date().toISOString();
    docData.updatedAt = new Date().toISOString();

    if (this.collectionName === 'users' && docData.password) {
      const salt = await bcrypt.genSalt(10);
      docData.password = await bcrypt.hash(docData.password, salt);
    }

    const docRef = await db.collection(this.collectionName).add(docData);
    
    const instance = Object.create(this.prototype);
    Object.assign(instance, docData, {
      _id: docRef.id,
      id: docRef.id,
      collectionName: this.collectionName,
      save: async function() {
        const dData = { ...this };
        const id = dData._id;
        delete dData._id;
        delete dData.id;
        delete dData.collectionName;
        delete dData.save;
        
        dData.updatedAt = new Date().toISOString();

        // Strip Mongoose IDs or populate elements to raw strings
        for (const [key, val] of Object.entries(dData)) {
          if (val && typeof val === 'object' && val._id) {
            dData[key] = val._id;
          }
        }

        await db.collection(this.collectionName).doc(id).set(dData);
        return this;
      }
    });
    return instance;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    if (!id) return null;
    const docRef = db.collection(this.collectionName).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    
    let data = doc.data();

    // Mongoose update modifiers
    if (update.$push) {
      for (const [key, val] of Object.entries(update.$push)) {
        if (!Array.isArray(data[key])) data[key] = [];
        const rawVal = val?._id || val;
        data[key].push(rawVal);
      }
    }
    if (update.$pull) {
      for (const [key, val] of Object.entries(update.$pull)) {
        if (Array.isArray(data[key])) {
          const rawVal = val?._id || val;
          data[key] = data[key].filter(v => v !== rawVal && (v?._id || v) !== rawVal);
        }
      }
    }

    const simpleUpdate = { ...update };
    delete simpleUpdate.$push;
    delete simpleUpdate.$pull;
    delete simpleUpdate.$set;

    if (update.$set) {
      Object.assign(data, update.$set);
    }
    Object.assign(data, simpleUpdate);
    
    // Convert object references to ID strings
    for (const [key, val] of Object.entries(data)) {
      if (val && typeof val === 'object' && val._id) {
        data[key] = val._id;
      }
    }

    data.updatedAt = new Date().toISOString();
    await docRef.set(data);

    const instance = Object.create(this.prototype);
    Object.assign(instance, data, {
      _id: id,
      id: id,
      collectionName: this.collectionName,
      save: async function() {
        const dData = { ...this };
        const iid = dData._id;
        delete dData._id;
        delete dData.id;
        delete dData.collectionName;
        delete dData.save;
        
        dData.updatedAt = new Date().toISOString();
        await db.collection(this.collectionName).doc(iid).set(dData);
        return this;
      }
    });
    return instance;
  }

  async findByIdAndDelete(id) {
    if (!id) return null;
    await db.collection(this.collectionName).doc(id).delete();
    return true;
  }

  async deleteOne(query) {
    const doc = await this.findOne(query);
    if (doc) {
      await db.collection(this.collectionName).doc(doc._id).delete();
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async deleteMany(query = {}) {
    const docs = await this.find(query);
    const batch = db.batch();
    docs.forEach(doc => {
      const ref = db.collection(this.collectionName).doc(doc._id);
      batch.delete(ref);
    });
    await batch.commit();
    return { deletedCount: docs.length };
  }

  async countDocuments(query = {}) {
    const results = await this.find(query);
    return results.length;
  }

  async updateMany(query, updateData) {
    const docs = await this.find(query);
    for (const doc of docs) {
      await this.findByIdAndUpdate(doc._id, updateData);
    }
    return { modifiedCount: docs.length };
  }
}

export default BaseModel;
