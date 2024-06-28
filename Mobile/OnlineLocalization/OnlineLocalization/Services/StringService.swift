//
//  StringService.swift
//  OnlineLocalization
//
//  Created by Emre ARIK on 28.06.2024.
//

import Foundation
import FirebaseStorage

class StringService {
    static let shared = StringService()
    
    private enum Keys: String {
        case strings
        case localizations
        case stringUnit
        case value
        
        var value: String {
            return rawValue
        }
    }
    
    func configure() {
        fetchStrings()
    }
    
    private func fetchStrings() {
        let jsonRef = Storage.storage().reference().child("Strings/TEST/Localizable.xcstrings")
        let localURL = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("Localizable.xcstrings")
        
        jsonRef.write(toFile: localURL) { url, error in
            if let error = error {
                print("Error occured: \(error.localizedDescription)")
                return
            }
            
            guard let url = url else {
                print("URL Error.")
                return
            }
            
            do {
                let jsonData = try Data(contentsOf: url)
                if let jsonObject = try JSONSerialization.jsonObject(with: jsonData, options: []) as? [String: Any] {
                    self.parseAndSaveStrings(json: jsonObject)
                } else {
                    print("Invalid Localizable file format.")
                }
            } catch {
                print("Failed to open Localizable file: \(error.localizedDescription)")
            }
        }
    }
    
    func parseAndSaveStrings(json: [String: Any]) {
        guard let strings = json[Keys.strings.value] as? [String: Any] else {
            print("Invalid JSON format.")
            return
        }
        
        var stringList: [StringModel] = []
        
        for (key, stringValue) in strings {
            if let stringObject = stringValue as? [String: Any],
               let localizations = stringObject[Keys.localizations.value] as? [String: Any] {
                
                for (languageCode, localizationValue) in localizations {
                    if languageCode == currentLanguage, let localization = localizationValue as? [String: Any],
                       let stringUnit = localization[Keys.stringUnit.value] as? [String: Any],
                       let value = stringUnit[Keys.value.value] as? String {
                        let data = StringModel(key: key, languageCode: languageCode, value: value)
                        stringList.append(data)
                    }
                }
            }
        }
        
        do {
            try StringProvider.addOrUpdate(objects: stringList) {
                print("All strings updated successfully.")
            }
        } catch {
            print("Error: \(error.localizedDescription)")
        }
    }
    
    var currentLanguage: String {
        let lang = NSLocale.current.language.languageCode?.identifier
        switch lang {
        case "en": return "en"
        case "de": return "de"
        case "fr": return "fr"
        case "es": return "es"
        case "it": return "it"
        case "pl": return "pl"
        default:
            return "en"
        }
    }
}
