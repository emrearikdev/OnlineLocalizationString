//
//  StringProvider.swift
//  OnlineLocalization
//
//  Created by Emre ARIK on 28.06.2024.
//

import Foundation
import RealmSwift

class StringProvider {
    static func stringModel(key: String, currentLanguage: String) -> StringModel? {
        do {
            let stringModel: Results<StringModel> = try RealmService.objects(ofType: StringModel.self)
            return stringModel.first { $0.key == key && $0.languageCode == currentLanguage }
        } catch {
            print("Error retrieving objects: \(error)")
            return nil
        }
    }
    
    static func addOrUpdate(objects: [StringModel], completion: (() -> Void)? = nil) throws {
        try RealmService.addOrUpdate(objects, completion: completion)
    }
}
