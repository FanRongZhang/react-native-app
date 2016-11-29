/**
 *
 * @author keyy/1501718947@qq.com 16/11/21 18:10
 * @description
 */
import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableHighlight,
  Animated,
  Picker,
  Image,
  Platform,
  PickerIOS,
  ActionSheetIOS,
  Dimensions
} from 'react-native'
import BaseComponent from '../base/BaseComponent'
import MainContainer from '../containers/MainContainer'
import Icon from 'react-native-vector-icons/FontAwesome'
import Modal from 'react-native-modalbox'
import {Button as NBButton} from 'native-base'
import {StyleConfig, CommonStyles} from '../style'
import ImagePicker from 'react-native-image-picker'
import ImageViewer from '../components/ImageViewer'
import Spinner from '../components/Spinner'
import Menu, {
  MenuContext,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu'
import RNPicker from 'react-native-picker'
import {List, ListItem, Text as NBText, CheckBox as NBCheckBox} from 'native-base'
import CheckBox from '../components/CheckBox'
import * as Storage from '../utils/Storage'
import {connect} from 'react-redux'
import * as FriendFilterActions from '../actions/FriendFilter'

const {width, height}=Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E2E2'
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 10
  },
  inputArea: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d4cfcf',
    alignItems: 'center'
  },
  inputLabel: {
    width: 100
  },
  pickerItem: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    paddingHorizontal: 10
  },
  pickerTextView: {
    flex: 1
  },
  pickerText: {
    textAlignVertical: 'center'
  },
  datingFilterArea: {
    marginTop: 30
  },
  datingFilterTitle: {
    fontSize: 18,
    marginBottom: 10
  },
  datingFilter: {
    borderTopWidth: 1,
    borderTopColor: '#d4cfcf'
  },
  datingPurposeLabel: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center'
  },
  listItem: {
    marginTop: 10
  },
  checkBoxView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  checkBoxItem: {
    width: (width - 30) / 2,
    height: 40
  },
  checkBoxLabel: {
    marginLeft: 10,
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'nowrap'
  }
});

const tmpGenderArr = ['不限', '男', '女'];
const tmpPhotoOnlyArr = ['不限', '是', '否'];

let DictMap = {
  EducationLevelDict: [],
  IncomeLevelDict: [],
  JobTypeDict: [],
  MarriageStatusDict: []
  //DatingPurposeDict:[]
};

let DatingPurposeSelect = [
  {Key: 'Love', Value: '男女朋友', Checked: false},
  {Key: 'RelationShip', Value: '异性知己', Checked: false},
  {Key: 'FriendShip', Value: '好友', Checked: false},
  {Key: 'Other', Value: '中介或其他', Checked: false}
];

let DatingPurposeSelectCopy = [];

class FriendsFilter extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      ageRangeText: '不限',
      minAge: 18,
      maxAge: 80,
      heightRangeText: '不限',
      minHeight: 175,
      maxHeight: 195,
      genderText: '不限',
      gender: null,
      genderFilter: 0,
      educationText: '不限',
      minEducation: 0,
      maxEducation: 3,
      education: 2,
      datingPurpose: {
        friendShip: false,
        relationShip: false,
        love: false,
        other: false
      },
      photoOnly: false,
      photoOnlyText:'不限'
    }
  }

  componentWillMount() {
    for (let i in DictMap) {
      Storage.getItem(`${i}`).then((response)=> {
        if (response && response.length > 0) {
          response.forEach((j)=> {
            DictMap[i].push(j.Value);
          });
        } else {
          console.error('获取下拉选项字典出错');
        }
      })
    }
  }

  //保存交友信息
  saveFriendFilter(data,datingPurpose) {
    const {dispatch}=this.props;
    dispatch(FriendFilterActions.saveFriendFilter(data,datingPurpose, (json)=> {
      this.goHome();
    }, (error)=> {
      //console.log(error)
    }));
  }

  //去首页
  goHome() {
    const {navigator} =this.props;
    navigator.push({
      component: MainContainer,
      name: 'MainContainer'
    });
  }

  //下一步
  goNext() {
    const {navigator} =this.props;
    navigator.push({
      component: MainContainer,
      name: 'MainContainer'
    });
  }

  getNavigationBarProps() {
    return {
      title: '交友信息'
    };
  }

  renderDatingPurpose(DatingPurposeSelect) {
    return (
      <View style={styles.checkBoxView}>
        {DatingPurposeSelect.map((item)=> {
          return (
            <CheckBox
              key={item.Value}
              label={item.Value}
              labelStyle={styles.checkBoxLabel}
              checked={item.Checked}
              style={styles.checkBoxItem}
              onChange={(checked)=> {
                item.Checked = checked;
                if (checked) {
                  DatingPurposeSelectCopy.push(item);
                } else {
                  let index = 0;
                  for (let i = 0; i < DatingPurposeSelectCopy.length; i++) {
                    if (DatingPurposeSelectCopy[i].Key == item.Key) {
                      index = i;
                      break;
                    }
                  }
                  DatingPurposeSelectCopy.splice(index, 1);
                }
              }}/>
          )
        })}
      </View>
    )
  }

  _createAgeRangeData() {
    let data = [], unLimitAge = [];
    unLimitAge.push('不限');
    for (let m = 18; m < 81; m++) {
      unLimitAge.push(m + '');
    }
    data.push({'不限': unLimitAge});
    for (let i = 18; i < 80; i++) {
      let maxAge = [];
      for (let j = 19; j < 81; j++) {
        if (i < j) {
          if (maxAge.indexOf('不限') < 0) {
            maxAge.push('不限');
          }
          maxAge.push(j + '');
        }
      }
      let _maxAge = {};
      _maxAge[i + ''] = maxAge;
      data.push(_maxAge);
    }
    return data;
  }

  _createHeightRangeData() {
    let data = [];
    data.push({'不限': ['不限']});
    for (let i = 100; i < 200; i++) {
      let maxHeight = [];
      for (let j = 101; j < 201; j++) {
        if (i < j) {
          if (maxHeight.indexOf('不限') < 0) {
            maxHeight.push('不限');
          }
          maxHeight.push(j + '');
        }
      }
      let _maxHeight = {};
      _maxHeight[i + ''] = maxHeight;
      data.push(_maxHeight);
    }
    return data;
  }

  _createEducationData() {
    //DictMap['EducationLevelDict'].push('不限');
    return DictMap['EducationLevelDict'];
  }

  _renderDoublePicker(text, title, minValue, maxValue, _createData) {
    return (
      <TouchableHighlight
        onPress={()=> {
          this._showPicker(_createData, text, title, minValue, maxValue);
        }}
        style={styles.pickerItem}
        activeOpacity={0.5}
        underlayColor="rgba(247,245,245,0.7)">
        <View style={styles.pickerTextView}>
          <Text style={styles.pickerText}>
            {this.state[`${text}`]}
          </Text>
        </View>
      </TouchableHighlight>
    )
  }

  _showPicker(_createData, text, title, minValue, maxValue) {
    RNPicker.init({
      pickerTitleText: title,
      pickerData: _createData,
      selectedValue: [`${minValue}`, `${maxValue}`],
      onPickerConfirm: pickedValue => {
        this._updateState(text, pickedValue);
        RNPicker.hide();
      },
      onPickerCancel: pickedValue => {
        RNPicker.hide();
      },
      onPickerSelect: pickedValue => {
        this._updateState(text, pickedValue);
      }
    });
    RNPicker.show();
  }

  _updateState(text, pickedValue) {
    switch (text) {
      case 'ageRangeText':
        if (pickedValue[0] == '不限' && pickedValue[1] == '不限') {
          this.setState({
            ageRangeText: '不限',
            minAge: null,
            maxAge: null
          });
        } else if (pickedValue[0] == '不限' && pickedValue[1] != '不限') {
          this.setState({
            ageRangeText: `${pickedValue[1]}岁以下`,
            minAge: null,
            maxAge: parseInt(pickedValue[1])
          });
        } else if (pickedValue[0] != '不限' && pickedValue[1] == '不限') {
          this.setState({
            ageRangeText: `${pickedValue[0]}岁以上`,
            minAge: parseInt(pickedValue[0]),
            maxAge: null
          });
        } else {
          this.setState({
            ageRangeText: `${pickedValue[0]}-${pickedValue[1]}岁`,
            minAge: parseInt(pickedValue[0]),
            maxAge: parseInt(pickedValue[1])
          });
        }
        break;
      case 'heightRangeText':
        if (pickedValue[0] == '不限') {
          this.setState({
            heightRangeText: '不限',
            minHeight: 100,
            maxHeight: 200
          });
        } else if (pickedValue[0] != '不限' && pickedValue[1] == '不限') {
          this.setState({
            heightRangeText: `${pickedValue[0]}cm以上`,
            minHeight: parseInt(pickedValue[0]),
            maxHeight: 80
          });
        } else {
          this.setState({
            heightRangeText: `${pickedValue[0]}-${pickedValue[1]}cm`,
            minHeight: parseInt(pickedValue[0]),
            maxHeight: parseInt(pickedValue[1])
          });
        }
        break;
      case 'educationText':
        this.setState({
          educationText: pickedValue[0]
        });
        break;
      case 'genderText':
        this.setState({
          genderText: pickedValue[0],
          gender: pickedValue[0] == '不限' ? null : pickedValue[0] == '男'
        });
        break;

      case 'photoOnlyText':
        this.setState({
          photoOnlyText: pickedValue[0],
          photoOnly: pickedValue[0] == '不限' ? null : pickedValue[0] == '是'
        });
        break;
      default:
        console.error('设置数据出错!');
        break;
    }
  }

  _renderSinglePicker(text, title, value, _createData) {
    return (
      <TouchableHighlight
        onPress={()=> {
          this._showSinglePicker(_createData, text, title, value);
        }}
        style={styles.pickerItem}
        activeOpacity={0.5}
        underlayColor="rgba(247,245,245,0.7)">
        <View style={styles.pickerTextView}>
          <Text style={styles.pickerText}>
            {this.state[`${text}`]}
          </Text>
        </View>
      </TouchableHighlight>
    )
  }

  _showSinglePicker(_createData, text, title, value) {
    RNPicker.init({
      pickerTitleText: title,
      pickerData: _createData,
      selectedValue: [this.state[`${text}`]],
      onPickerConfirm: pickedValue => {
        this._updateState(text, pickedValue);
        RNPicker.hide();
      },
      onPickerCancel: pickedValue => {
        RNPicker.hide();
      },
      onPickerSelect: pickedValue => {
        this._updateState(text, pickedValue);
      }
    });
    RNPicker.show();
  }

  _updateCheckStatus(text, data) {
    switch (text) {
      case 'love':
        this.setState({
          datingPurpose: {
            ...this.state.datingPurpose,
            love: !data
          }
        });
        break;
      case 'friendShip':
        this.setState({
          datingPurpose: {
            ...this.state.datingPurpose,
            friendShip: !data
          }
        });
        break;
      case 'relationShip':
        this.setState({
          datingPurpose: {
            ...this.state.datingPurpose,
            relationShip: !data
          }
        });
        break;
      case 'other':
        this.setState({
          datingPurpose: {
            ...this.state.datingPurpose,
            other: !data
          }
        });
        break;
      default:
        console.error('选择交友目的出错');
        break;
    }
  }

  renderBody() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          keyboardDismissMode={'none'}
          keyboardShouldPersistTaps={true}>
          <View style={styles.inputArea}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{'年龄'}</Text>
              {this._renderDoublePicker('ageRangeText', '请选择年龄范围', this.state.minAge + '', this.state.maxAge + '', this._createAgeRangeData())}
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{'身高'}</Text>
              {this._renderDoublePicker('heightRangeText', '请选择身高范围', this.state.minHeight + '', this.state.maxHeight + '', this._createHeightRangeData())}
            </View>
            {/*<View style={styles.inputRow}>
             <Text style={styles.inputLabel}>{'学历'}</Text>
             {this._renderSinglePicker('educationText', '请选择学历', 'education', this._createEducationData())}
             </View>*/}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{'性别'}</Text>
              {this._renderSinglePicker('genderText', '请选择性别', 'gender', tmpGenderArr)}
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>{'只看有照片的人'}</Text>
              {this._renderSinglePicker('photoOnlyText', '是否只看有照片的人', this.state.gender, tmpPhotoOnlyArr)}
            </View>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.datingPurposeLabel}>{'交友目的'}</Text>
            {this.renderDatingPurpose(DatingPurposeSelect)}
          </View>

          {/*<View style={styles.datingFilterArea}>
           <Text style={styles.datingFilterTitle}>{'交友目的'}</Text>
           <View style={styles.datingFilter}>
           <View style={styles.checkBoxRow}>
           <ListItem
           style={{flex: 1}}
           onPress={()=> {
           this._updateCheckStatus('love', this.state.datingPurpose.love)
           }}>
           <NBCheckBox
           checked={this.state.datingPurpose.love}/>
           <NBText style={styles.checkBoxText}>{'男女朋友'}</NBText>
           </ListItem>
           <ListItem
           style={{flex: 1}}
           onPress={()=> {
           this._updateCheckStatus('relationShip', this.state.datingPurpose.relationShip)
           }}>
           <NBCheckBox checked={this.state.datingPurpose.relationShip}/>
           <NBText style={styles.checkBoxText}>{'异性知己'}</NBText>
           </ListItem>
           </View>
           <View style={styles.checkBoxRow}>
           <ListItem
           style={styles.checkBoxItem}
           onPress={()=> {
           this._updateCheckStatus('friendShip', this.state.datingPurpose.friendShip)
           }}>
           <NBCheckBox checked={this.state.datingPurpose.friendShip}/>
           <NBText style={styles.checkBoxText}>{'好友'}</NBText>
           </ListItem>
           <ListItem
           style={styles.checkBoxItem}
           onPress={()=> {
           this._updateCheckStatus('other', this.state.datingPurpose.other)
           }}>
           <NBCheckBox
           checked={this.state.datingPurpose.other}/>
           <NBText style={styles.checkBoxText}>{'中介或其他'}</NBText>
           </ListItem>
           </View>
           </View>
           </View>*/}
          {/*<NBButton
            block
            style={{
              height: 40,
              marginTop: 30
            }}
            onPress={()=> {
              this.goHome()
            }}>
            去首页(Test)
          </NBButton>*/}
          <NBButton
            block
            style={{marginVertical: 30}}
            onPress={()=> {
              this.saveFriendFilter(this.state,DatingPurposeSelectCopy)
            }}>
            完成注册
          </NBButton>
        </ScrollView>
      </View>
    )
  }

  renderSpinner() {
    if (this.props.pendingStatus) {
      return (
        <Spinner animating={this.props.pendingStatus}/>
      )
    }
  }

}

export default connect((state)=> {
  return {
    pendingStatus: state.InitialApp.pending
  }
})(FriendsFilter)