//
//  StringModel.swift
//  OnlineLocalization
//
//  Created by Emre ARIK on 28.06.2024.
//

import Foundation
import RealmSwift

class StringModel: Object {
    @objc dynamic var key: String = ""
    @objc dynamic var languageCode: String = ""
    @objc dynamic var value: String = ""
    
    override static func primaryKey() -> String? {
        return "key"
    }
    
    convenience init(key: String, languageCode: String, value: String) {
        self.init()
        self.key = key
        self.languageCode = languageCode
        self.value = value
    }
}
