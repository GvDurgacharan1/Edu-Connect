import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../firebase-mock-db.json');

let db;
let isMock = false;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
const databaseURL = process.env.FIREBASE_DATABASE_URL; // Realtime DB endpoint URL

if (projectId && clientEmail && privateKey) {
  try {
    let cleanedKey = privateKey.trim();
    if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
      cleanedKey = cleanedKey.substring(1, cleanedKey.length - 1);
    }
    if (cleanedKey.includes('\\n')) {
      cleanedKey = cleanedKey.replace(/\\n/g, '\n');
    }

    let cleanedEmail = clientEmail.trim();
    if (cleanedEmail.startsWith('"') && cleanedEmail.endsWith('"')) {
      cleanedEmail = cleanedEmail.substring(1, cleanedEmail.length - 1);
    }

    let cleanedProject = projectId.trim();
    if (cleanedProject.startsWith('"') && cleanedProject.endsWith('"')) {
      cleanedProject = cleanedProject.substring(1, cleanedProject.length - 1);
    }
    
    const appsList = getApps();
    if (!appsList.length) {
      initializeApp({
        credential: cert({
          projectId: cleanedProject,
          clientEmail: cleanedEmail,
          privateKey: cleanedKey
        }),
        databaseURL: databaseURL || undefined
      });
    }

    if (databaseURL) {
      // Connect to Realtime Database and wrap it with Firestore-like API!
      const rtdb = getDatabase();
      console.log('Firebase Admin SDK initialized successfully. Using Realtime Database at:', databaseURL);
      
      db = {
        collection: (name) => {
          const ref = rtdb.ref(name);
          return {
            doc: (id) => {
              const docRef = {
                get: async () => {
                  const snapshot = await ref.child(id).once('value');
                  const docVal = snapshot.val();
                  return {
                    exists: docVal !== null,
                    id,
                    data: () => docVal ? JSON.parse(JSON.stringify(docVal)) : null
                  };
                },
                set: async (val) => {
                  await ref.child(id).set(JSON.parse(JSON.stringify(val)));
                },
                delete: async () => {
                  await ref.child(id).remove();
                }
              };
              return docRef;
            },
            add: async (val) => {
              const newRef = ref.push();
              await newRef.set(JSON.parse(JSON.stringify(val)));
              return { id: newRef.key };
            },
            get: async () => {
              const snapshot = await ref.once('value');
              const dataVal = snapshot.val() || {};
              const docs = Object.entries(dataVal).map(([id, docVal]) => {
                return {
                  id,
                  data: () => JSON.parse(JSON.stringify(docVal))
                };
              });
              return { docs };
            }
          };
        },
        batch: () => {
          const ops = [];
          return {
            delete: (docRef) => {
              ops.push({ type: 'delete', ref: docRef });
            },
            commit: async () => {
              for (const op of ops) {
                if (op.type === 'delete') {
                  await op.ref.delete();
                }
              }
            }
          };
        }
      };
    } else {
      // Standard Cloud Firestore client
      db = getFirestore();
      console.log('Firebase Admin SDK initialized successfully. Using Firestore.');
    }
  } catch (error) {
    console.error('Firebase initialization error. Falling back to local database mock:', error.message);
    initializeMockDb();
  }
} else {
  console.log('Firebase credentials not found in .env. Falling back to Local JSON Sandbox Database.');
  initializeMockDb();
}

function initializeMockDb() {
  isMock = true;
  
  class LocalFirestoreMock {
    constructor() {
      this.data = {};
      this._load();
    }

    _load() {
      try {
        if (fs.existsSync(dbPath)) {
          const content = fs.readFileSync(dbPath, 'utf8');
          this.data = JSON.parse(content || '{}');
        } else {
          this.data = {};
          this._save();
        }
      } catch (err) {
        console.error('Error loading local mock database file:', err.message);
        this.data = {};
      }
    }

    _save() {
      try {
        fs.writeFileSync(dbPath, JSON.stringify(this.data, null, 2), 'utf8');
      } catch (err) {
        console.error('Error saving local mock database file:', err.message);
      }
    }

    collection(name) {
      if (!this.data[name]) {
        this.data[name] = {};
        this._save();
      }

      return {
        doc: (id) => {
          const docRef = {
            get: async () => {
              const docVal = this.data[name][id];
              return {
                exists: !!docVal,
                id,
                data: () => docVal ? JSON.parse(JSON.stringify(docVal)) : null
              };
            },
            set: async (val) => {
              this.data[name][id] = JSON.parse(JSON.stringify(val));
              this._save();
            },
            delete: async () => {
              delete this.data[name][id];
              this._save();
            }
          };
          return docRef;
        },
        add: async (val) => {
          const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          this.data[name][id] = JSON.parse(JSON.stringify(val));
          this._save();
          return { id };
        },
        get: async () => {
          const docs = Object.entries(this.data[name] || {}).map(([id, docVal]) => {
            return {
              id,
              data: () => JSON.parse(JSON.stringify(docVal))
            };
          });
          return {
            docs
          };
        }
      };
    }

    batch() {
      const ops = [];
      return {
        delete: (docRef) => {
          ops.push({ type: 'delete', ref: docRef });
        },
        commit: async () => {
          for (const op of ops) {
            if (op.type === 'delete') {
              await op.ref.delete();
            }
          }
        }
      };
    }
  }

  db = new LocalFirestoreMock();
}

export { db, isMock };
export default db;
