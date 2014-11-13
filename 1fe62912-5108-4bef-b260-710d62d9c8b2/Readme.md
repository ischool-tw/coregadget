## 提供各成績的自動進位設定。

# JavaScript 範例：

    init({
      application: "dev.sh_d", //"dev.jh_kh", //"http://test.iteacher.tw/cs4/test_gadget",
      paramValues: {
        flex_params: '<Params><DefaultRound>0</DefaultRound><Round Name=\'期末考\'>1</Round><Semester>0</Semester></Params>'
      }
    });
    
# Gadget Xml 範例：

## 提供過慮「協同教學」之課程。

如果課程指定為「協同教學」類別，將不會列在此 Gadget 中。

## 成績計算最多是小數二位，就算有設定也是，因為程式中之前已經寫固定了。
