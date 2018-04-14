//
//  OfflineVC.swift
//  RoutableApp
//
//  Created by Edward Arenberg on 4/14/18.
//  Copyright © 2018 Edward Arenberg. All rights reserved.
//

import UIKit

class OfflineVC: UIViewController {

    var isActive = false
    var hasRoute = false {
        didSet {
            if hasRoute {
                if let vc = self.storyboard?.instantiateViewController(withIdentifier: "NewJobVC") {
                    present(vc, animated: true, completion: nil)
                }
            }
        }
    }
    private var pendingRequestWorkItem: DispatchWorkItem?

    @IBOutlet weak var activeButton: UIButton! {
        didSet {
            activeButton.contentEdgeInsets = UIEdgeInsets(top: 8, left: 20, bottom: 8, right: 20)
            activeButton.layer.cornerRadius = 10
            activeButton.layer.borderWidth = 2
        }
    }
    @IBAction func activeHit(_ sender: UIButton) {
        /*
        if let vc = self.storyboard?.instantiateViewController(withIdentifier: "ViewController") {
            self.view.window?.rootViewController = vc
        }
         */
        isActive = !isActive
        UIView.animate(withDuration: 0.4) {
            self.activeButton.setTitle(self.isActive ? "Pause" : "Active", for: .normal)
            self.seekingSV.isHidden = !self.isActive
        }
        if isActive {
            let requestWorkItem = DispatchWorkItem { [weak self] in
                self?.hasRoute = true
            }
            // Save the new work item and execute it after 250 ms
            pendingRequestWorkItem = requestWorkItem
            DispatchQueue.main.asyncAfter(deadline: .now() + 4,
                                          execute: requestWorkItem)

        } else {
            pendingRequestWorkItem?.cancel()
        }
    }
    @IBOutlet weak var seekingSV: UIStackView!
    
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
