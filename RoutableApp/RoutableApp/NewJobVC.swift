//
//  NewJobVC.swift
//  RoutableApp
//
//  Created by Edward Arenberg on 4/14/18.
//  Copyright © 2018 Edward Arenberg. All rights reserved.
//

import UIKit

class NewJobVC: UIViewController {

    @IBOutlet weak var mtoLabel: UILabel!
    
    @IBOutlet weak var dropView: UIView! {
        didSet {
            dropView.layer.cornerRadius = 10
            dropView.layer.borderWidth = 0.5
            dropView.layer.borderColor = UIColor.lightGray.cgColor
        }
    }
    @IBOutlet weak var dropAddressLabel: UILabel!
    @IBOutlet weak var dropMapView: UIWebView!
    
    @IBOutlet weak var pickView: UIView!
    @IBOutlet weak var pickAddressLabel: UILabel!
    @IBOutlet weak var pickWebView: UIWebView!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
