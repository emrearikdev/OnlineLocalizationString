//
//  RealmService.swift
//  OnlineLocalization
//
//  Created by Emre ARIK on 28.06.2024.
//

import Foundation
import RealmSwift

class RealmService {
    static let version: UInt64 = 1
    
    static func configure() {
        Realm.Configuration.defaultConfiguration = Realm.Configuration(schemaVersion: version, migrationBlock: migrate)
    }
    
    static func objects<T: Object>(ofType type: T.Type) throws -> Results<T> {
        let realm = try Realm()
        return realm.objects(type)
    }
    
    static func write(_ completion: () -> Void) throws {
        let realm = try Realm()
        try realm.safeWrite(completion)
    }
    
    static func addOrUpdate(_ objects: [Object], completion: (() -> Void)? = nil) throws {
        let realm = try Realm()
        try realm.safeWrite {
            realm.add(objects, update: .all)
            DispatchQueue.main.async { completion?() }
        }
    }
    
    static func migrate(migration: Migration, oldVersion: UInt64) {
    }
}

extension Realm {
    func safeWrite( _ safeWriteClosure: () -> Void) throws {
        if isInWriteTransaction {
            safeWriteClosure()
        } else {
            try write { safeWriteClosure() }
        }
    }
}
