### 各項修改註記：

- 提供過慮「協同教學」之課程，如果課程指定為「協同教學」類別，將不會列在此 Gadget 中。
- 成績計算最多是小數二位，就算有設定超過二位，結果也會被限制在二位，因為程式中之前已經寫固定了。

### 提供各成績的自動進位設定。

- JavaScript 範例：
```
    init({
      application: "dev.sh_d",
      paramValues: {
        flex_params: '<Params><DefaultRound>0</DefaultRound><Round Name=\'期末考\'>1</Round><Semester>0</Semester></Params>'
      }
    });
```
- Gadget Xml 範例：
```
		<Gadget Description="定期評量成績登" deployPath="1fe62912-5108-4bef-b260-710d62d9c8b2">
			<Params>
				<Param name="flex_params"><![CDATA[<Params><DefaultRound>0</DefaultRound><Round Name=\'期末考\'>1</Round><Semester>0</Semester></Params>]]></Param>
			</Params>
		</Gadget>
```
- 規格說明

1. DefaultRound：預設的進位方式。
2. Round：指定評量名稱進位方式。
3. 學期成績試算進位方式。
