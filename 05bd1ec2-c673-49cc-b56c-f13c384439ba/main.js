var modal = Vue.extend({
	template: '#modal-template',
	props: ['modal-id']
});

Vue.component('tuition-fees', {
	template: '#tuition-fees-template',
	props: ['sel-item', 'school-year', 'semester'],
	data: function() {
		return {
			changeFeeModalId: "changeFeeModal",
			deleteModalId: "deleteModal",
			errMsg: null,
			loading: false,
			students: [],
			newFee: 0,
			setting: false,
			checkAll: false,
			flag: 0,
			currentModal: null,
			saving: false,
		}
	},
	computed: {
		filterFlag: function() {
			let fcount = 0;
			[].concat(this.students || []).forEach(function(stu) {
				if (stu.checked) fcount++;
			});
			return this.flag = fcount;
		},
		watchSelItem: function() {
			if (this.selItem) {
				this.getTuitionFees();
			}
			return;
		}
	},
	methods: {
		getTuitionFees: function() {
			let self = this;

			self.students = [];
			
			if (self.selItem) {
				self.loading = true;

				vm.$root.connection.send({
					service: '_.GetTuitionWaiver',
					body: {
						Request: {
							'學年度': self.schoolYear,
							'學期': self.semester,
							'異動標準名稱': self.selItem
						}
					},
					result: function(response, error) {
						if (!error) {
							self.students = [].concat(response.Response['Student'] || []);
							self.students.map(function(item){
								self.$set(item, 'checked', false);
							});
							
							self.loading = false;
						}
					}
				});
			}
		},
		showChangeFeeModel: function() {
			this.errMsg = null;
			this.newFee = 0;
			this.setting = false;
			
			$('#'+this.changeFeeModalId).one('shown.bs.modal', function() {
				$('#tuitionNewFee').focus().select();
			});
			$('#'+this.changeFeeModalId).modal('show');
			this.currentModal = 'change-fee-modal';
		},
		changeFee: function() {
			let self = this;

			if (self.setting) return;
			if ($.isNumeric(self.newFee)) {
				self.setting = true;

				let data = [];
				[].concat(self.students || []).forEach(function(stu) {
					if (stu.checked) {
						data.push({ '收費表': stu["收費表"], '異動金額': self.newFee });
					}
				});

				vm.$root.connection.send({
					service: '_.SetTuitionWaiver',
					body: {
						'學年度': self.schoolYear,
						'學期': self.semester,
						'異動標準名稱': self.selItem,
						'異動': data
					},
					result: function(response, error) {
						self.setting = false;
						if (!error) {
							if (response.success) {
								self.currentModal = null;
								$('#'+self.changeFeeModalId).modal('hide');
								self.getTuitionFees();
							} else {
								self.errMsg = response.errMsg;
							}
						} else {
							self.errMsg = '發生錯誤，修改失敗！';
						}
					}
				});
			}
		},
		setCheckedAll: function() {
			let self = this;

			[].concat(this.students || []).forEach(function(stu) {
				stu.checked = self.checkAll;
			});
		},
		showDeleteModel: function() {
			this.errMsg = null;
			this.newFee = 0;
			this.saving = false;
			$('#'+this.deleteModalId).modal('show');
			this.currentModal = 'delete-modal';
		},
		deleteStu: function() {
			let self = this;

			if (self.saving) return;
			self.saving = true;

			let delData = [];
			[].concat(this.students || []).forEach(function(stu) {
				if (stu.checked) delData.push(stu['收費表']);
			});

			vm.$root.connection.send({
				service: '_.DelTuitionWaiver',
				body: {
					Request: {
						TuitionWaiver: {
							Condition1: {
								'學年度': self.schoolYear,
								'學期': self.semester,
								'異動標準名稱': self.selItem,
							},
							Condition2: {
								'收費表': delData
							}
						}
					}
				},
				result: function(response, error) {
					self.saving = false;
					if (!error) {
						self.currentModal = null;
						$('#'+self.deleteModalId).modal('hide');
						self.getTuitionFees();
					} else {
						if (error.dsaError && error.dsaError.status == '504') {
							self.errMsg = error.dsaError.message;
						}
						else {
							self.errMsg = "發生錯誤，刪除失敗！";
						}
					}
				}
			});					
		},
	},
	components: {
		'change-fee-modal': modal,
		'delete-modal': modal,
	}
});

Vue.component('import-fees', {
	template: '#import-fees-template',
	props: ['sel-item', 'school-year', 'semester'],
	data: function() {
		return {
			placeHolder: "範例：\n10501001\n10501002",
			reviseFeeModalId: "reviseFeeModal",
			errMsg: null,
			step: 1,
			sourceData: null,
			parsing: false,
			students: [],
			newFee: 0,
			setting: false,
			saving: false,
		}
	},
	mounted: function() {
		this.sourceData = null;
		this.toStep(1);
	},
	methods: {
		parseStuNumbers: function(sData) {
			let data = (sData || '').split("\n");
			let items = [];

			data.forEach(function (item) {
				item = item.trim();
				if (item.length) {
					items.push(item);
				}
			});
			return items;
		},
		toStep: function(num) {
			if (num == 1) {
				this.students = [];
				this.parsing = false;
				$('#sourceData').focus();
			} else {
				this.setting = false;
			}
			this.errMsg = null;
			this.step = num;
		},
		imports: function() {
			let self = this;

			if (self.parsing) return;
			if (!self.sourceData) return;

			// 1. 解析學生學號
			// 2. 呼叫 service 以學號取得學生，並取得試算後的結果
			self.parsing = true;
			self.students = [];
			let tmpStudentNumbers = self.parseStuNumbers(self.sourceData);
			if (tmpStudentNumbers.length) {
				vm.$root.connection.send({
					service: '_.GetStudentTuitionWaiver',
					body: {
						Request: {
							Condition1: {
								'學年度': self.schoolYear,
								'學期': self.semester
							},
							Condition2: {
								'異動標準名稱': self.selItem
							},
							Condition3: {
								'學號': tmpStudentNumbers
							}
						}
					},
					result: function(response, error) {
						if (!error) {
							self.students = [].concat(response.Response['收費表異動明細'] || []);
							self.students.map(function(item){
								self.$set(item, 'checked', false);
							});
							
							if (self.students.length) {
								self.toStep(2);
							}
							else {
								self.errMsg = '查無學生';
							}
							self.parsing = false;
						} else {
							self.errMsg = '發生錯誤，執行失敗';
							$('#sourceData').focus();
							self.parsing = false;
						}
					}
				});
			} else {
				self.errMsg = '查無學生';
				$('#sourceData').focus();
				self.parsing = false;
			}
		},
		showReviseFeeModel: function() {
			this.errMsg = null;
			this.newFee = 0;
			this.setting = false;
			$('#'+this.reviseFeeModalId).one('shown.bs.modal', function() {
				$('#importStusNewFee').focus().select();
			});
			$('#'+this.reviseFeeModalId).modal('show');
		},
		reviseFee: function() {
			let self = this;

			if (self.setting) return;
			if ($.isNumeric(self.newFee)) {
				self.setting = true;
				[].concat(self.students || []).forEach(function(stu) {
					stu["異動金額"] = self.newFee;
				});

				self.currentModal = null;
				$('#'+this.reviseFeeModalId).modal('hide');
				self.setting = false;
			}
		},
		doCreate: function() {
			let self = this;

			if (self.setting) return;
			self.setting = true;

			let data = [];
			[].concat(self.students || []).forEach(function(stu) {
				data.push({ '收費表': stu["收費表"], '異動金額': stu["異動金額"] });
			});

			vm.$root.connection.send({
				service: '_.SetTuitionWaiver',
				body: {
					'學年度': self.schoolYear,
					'學期': self.semester,
					'異動標準名稱': self.selItem,
					'異動': data
				},
				result: function(response, error) {
					self.setting = false;
					if (!error) {
						if (response.success) {
							self.currentModal = null;
							$('#'+this.reviseFeeModalId).modal('hide');
							self.toStep(3);
						} else {
							self.errMsg = response.errMsg;
						}
					} else {
						self.errMsg = '發生錯誤，修改失敗！';
					}
				}
			});
		},
	},
	components: {
		modal: modal
	}
});

// start app
let vm = new Vue({
	el: '#gadget',
	data: {
		connection: null,
		ready: false,
		currentView: null, // tuition-fees(default), import-fees
		schoolYear: null,
		semester: null,
		startDate: null,
		endDate: null,
		changeableItems: [],
		selItem: null,
	},
	mounted: function() {
		// 先取得 異動明細輸入時間，確認目前開放的學年期
		// 依學年期取得具權限的 異動標準
		let self = this;
		self.connection = gadget.getContract('hwsh.tuition_waiver.teacher');
		self.connection.send({
			service: '_.GetOpeningHours',
			body: {},
			result: function(response, error) {
				if (!error) {
					let openings = [].concat(response.Response['異動明細輸入時間'] || []);
					let hasOpenData = false;
					openings.forEach(function(item) {
						if (!hasOpenData) {
							if (item['開放中'] ==  't') {
								self.schoolYear = item['學年度'];
								self.semester = item['學期'];
								self.startDate = item['開始時間'];
								self.endDate = item['結束時間'];
								self.changeableItems = [];
							}

							if (self.schoolYear && self.semester) {
								hasOpenData = true;

								self.connection.send({
									service: '_.GetChangeItems',
									body: {
										Request: {
											'學年度': self.schoolYear,
											'學期': self.semester
										}
									},
									result: function(response, error) {
										if (!error) {
											let items = [].concat(response.Response['異動標準'] || []);
											
											items.forEach(function(item) {
												self.changeableItems.push(item['異動標準名稱']);
											});

											if (self.changeableItems.length > 0) self.selItem = self.changeableItems[0];
											self.ready = true;
											self.toggleView('tuition-fees');
										}
									}
								});
							}
						}
					});

					if (!hasOpenData) self.ready = true;
				}
			}
		});
	},
	computed: {
		convertSemester: function() {
			if (this.semester == 1) {
				return '上';
			} else {
				return '下';
			}
		}
	},
	filters: {
		date: function (value) {
			if (!value) return ''
			let dt = new Date(value);
			return dt.getFullYear() + '/' + (dt.getMonth()+1) + '/' + dt.getDate();
		}
	},
	methods: {
		toggleView: function(type) {
			this.currentView = type;
		},
		createSuccess: function() {
			this.toggleView('tuition-fees');
		}
	},
});