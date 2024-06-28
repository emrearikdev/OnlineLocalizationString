//
//  ViewController.swift
//  OnlineLocalization
//
//  Created by Emre ARIK on 28.06.2024.
//

import UIKit

class ViewController: UIViewController {
    @IBOutlet weak var label: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        label.text = .localized(.test_string1)
    }
}

