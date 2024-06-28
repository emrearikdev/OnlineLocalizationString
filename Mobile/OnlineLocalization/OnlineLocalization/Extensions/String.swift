//
//  String.swift
//  OnlineLocalization
//
//  Created by Emre ARIK on 29.06.2024.
//

import Foundation

extension String {
    static func localized(_ key: LocalizationKey, for language: String = "en") -> String {
        if let firebaseString = StringProvider.stringModel(key: key.rawValue, currentLanguage: language)?.value {
            return firebaseString
        } else {
            return String(localized: String.LocalizationValue(stringLiteral: key.rawValue))
        }
    }
}
