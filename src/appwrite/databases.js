// import { cloneElement } from 'react';
import {databases, collections} from './config'
import { ID } from 'appwrite'

const db = {};

collections.forEach(collection => {
    db[collection.name] = {
        create:async(payload, id=ID.unique()) => {
            return await databases.createDocument(
                collection.dbID,
                collection.id,
                id,
                payload
            )
        },
        update: async(id,payload) => {
            return await databases.updateDocument(
                collection.dbID,
                collection.id,
                id,
                payload
            )
        },
        delete: async(id)=>{
            return await databases.deleteDocument(
                collection.dbID,
                collection.id,
                id
            )
        },
        get: async(id)=>{
            return await databases.getDocument(
                collection.dbID,
                collection.id,
                id
            )
        },
        list: async(queries) =>{
            return await databases.listDocuments(
                collection.dbID,
                collection.id,
                queries
            )
        }
    }
})

export default db
