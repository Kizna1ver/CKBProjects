<template>
  <!-- 按钮触发模态框 -->
  <button class="btn btn-primary btn-lg" @click="showDepositBox">Deposit</button>
  <transition name="fade"><!-- transition不需要的话可以删掉 -->
   <div v-if="sampleModal">
     <div class="modal" v-on:click.self="sampleModal=false">
       <div class="modal-dialog">
         <div class="modal-content">
           <div class="modal-header">
             <h4 class="modal-title">Deposit by Force Bridge</h4>
             <button type="button" class="close" v-on:click="sampleModal=false">×</button>
           </div>
           <div class="modal-body" style="height:100%">
             Your ETH address:
             <p><b>{{ethAddr}}</b></p>
             Your Polyjuice address:
             <p><b>{{polyjuiceAddr}}</b></p>
             Your Layer2 deposit address:
             <p style="word-wrap:break-word;
word-break:normal;"><b>{{depositAddr}}</b></p>   
             <!-- <p>Your Layer2 Balance:{{CKBBalance}}</p>             -->
             <p>Your SUDT Balance:<b>{{SUDTBalance}}</b></p>    
             <p>Follow the steps below to transfer assets via Force Bridge</p>     
            <li>Go to the <a href="https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos" target="_blank">Force Bridge website</a></li>
            <li>Select Eth as an asset to transfer, then specify the amount. There will be a small fee.</li>
            <li>Copy your Layer 2 deposit address from above and paste in the box marked "recipient".</li>
            <li>Click the bridge button and sign the transaction with Metamask.</li>
           </div>
           <div class="modal-footer" style="text-align:center">
             <button type="button" class="btn btn-primary">OK!</button>
           </div>
         </div>
       </div>
     </div>
     <div class="modal-backdrop show"></div>
   </div>
 </transition>
  <div>
    <h1 class="title" style="text-align:center">Anonymous message board</h1>

    <div class="clearfix"></div>

    <h2 v-show="!bcConnected">Not connect to the blockchain: please wait.</h2>

    <h2 v-show="isLoading && bcConnected">Loading...</h2>

    <table class="table table-striped" v-show="!isLoading">
      <thead class="thead-dark">
        <tr>
          <!-- <th>User ID</th> -->
          <th>NickName</th>
          <th>Polyjuice Address</th>
          <th>Created At</th>
          <th>Updated At</th>
          <th>Messages</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" v-bind:key="user">
          <!-- <td>{{ user[0] }}</td> -->
          <td>{{ user[1] }}</td>
          <td><a style="color:rgb(0,122,204)" @click="showDepositBox(user)">{{ user[3] }}</a></td>
          <td>{{ toDate(user[4]) }}</td>
          <td>{{ toDate(user[5]) }}</td>
          <td>{{toAscii(user[2])}}</td>

        </tr>
         <!-- <button type="button" class="btn btn-primary" data-toggle="collapse" data-target="#demo">简单的折叠</button>
         <div id="demo" class="collapse">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </div> -->
      </tbody>
    </table>
    <div style="text-align:center">
      <button class="btn btn-info waves-effect waves-light mt2" @click="reloadList">
        Reload
      </button>
    </div>

  </div>
</template>

<script>
// import { stdin } from 'process';
// import { exec } from 'child_process';
import mixin from "../libs/mixinViews";
import axios from 'axios'
// import qs from 'qs'
// import { AddressTranslator } from 'nervos-godwoken-integration';

/**
 * List view component: this component shows list of the registered users
 * and their statuses.
 */
export default {
  mixins: [mixin],

  data() {
    return {
      users: [], // array that stores all the registered users
      isLoading: true, // true when the user list is loading form the blockchain
      bcConnected: false, // blockchain is connected ()
      tmoConn: null, // contain the intervalID given by setInterval
      sampleModal: false, // show the deposit messageBox
      ethAddr: '0xc7710FBf294205437EC365a4B194E7E901afBb04',  // deposited eth address
      polyjuiceAddr: '0x4D575E29991785909Ae5A8b7D6B689f5099bB724	',  // deposited polyjuice address
      depositAddr: '',  // Generated deposited address
      // CKBBalance:'200', // layer2 CKB balance
      SUDTBalance: '200',  // layer2 SUDT balance 
    };
  },

  methods: {
    /**
     * Get the list of the registered users once the connection to the
     * blockchain is established.
     */
    getUserList() {
      if (this.blockchainIsConnected()) {
        // it shows the loading message
        this.isLoading = true;

        // stopping the interval
        clearInterval(this.tmoConn);

        // getting all the users from the blockchain
        this.getAllUsers((userProfile) => {
          this.isLoading = false;
          this.users.push(userProfile);
        });
      }
    },

    /**
     * It reloads the user list.
     */
    reloadList() {
      this.users = [];
      this.getUserList();
    },

    /**
     * Get all users.
     */
    getAllUsers(callback) {
      window.bc
        .contract()
        .methods.totalUsers()
        .call({})
        .then((total) => {
          if (total > 0) {
            // getting the user one by one
            for (var i = 1; i <= total; i++) {
              window.bc
                .contract()
                .methods.getUserById(i)
                .call()
                .then((userProfile) => {
                  console.log(userProfile[2])
                  callback(userProfile);
                });
            }
          }
        });
    },
    
    /**
   * Deposit
   */
    async showDepositBox(user){
      const that = this
      this.sampleModal = true;
      console.log(user);
      axios({
        methods:'get',
        url:'http://localhost:8888/getDepositAddr',
        params:{
          ethAddr:that.ethAddr,
        }
      }).then((res) => {
        console.log("6666")
        console.log(res)
        this.depositAddr = res.data
      }).catch((err) => {
        console.log(err)
      })
      axios({
        methods:'get',
        url:'http://localhost:8888/getSUDTBalance',
        params:{}
      }).then((res) => {
        console.log(res)
        this.SUDTBalance = res.data
      }).catch((err) => {
        console.log(err)
      })
    },// end methods
  }, 

  created() {
    // it tries to get the user list from the blockchian once
    // the connection is established
    this.tmoConn = setInterval(() => {
      this.getUserList();
    }, 1000);
    // this.showDepositBox();
  },
};
</script>

<style>
 .modal {
  display: block;
}

/* 如果不使用vue的transition的话可以不设置 */
.fade-enter-active, .fade-leave-active {
  transition: opacity .15s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
