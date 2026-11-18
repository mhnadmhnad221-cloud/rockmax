import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView, View, Text, Pressable, StyleSheet, StatusBar,
  ScrollView, Alert
} from "react-native";

const choices = [
  { id: "rock", label: "حجر", emoji: "✊", color: "#3478F6" },
  { id: "paper", label: "ورقة", emoji: "✋", color: "#F4B942" },
  { id: "scissors", label: "مقص", emoji: "✌️", color: "#A855F7" },
];

const beats = { rock: "scissors", paper: "rock", scissors: "paper" };

function resultText(a, b) {
  if (a === b) return "تعادل!";
  return beats[a] === b ? "اللاعب الأول فاز!" : "اللاعب الثاني فاز!";
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [p1, setP1] = useState(null);
  const [p2, setP2] = useState(null);
  const [count, setCount] = useState(null);
  const [result, setResult] = useState("");
  const [round, setRound] = useState(1);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const timer = useRef(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function startGame() {
    resetRound();
    setScreen("local");
  }

  function resetRound() {
    if (timer.current) clearInterval(timer.current);
    setP1(null); setP2(null); setCount(null); setResult("");
  }

  function choose(player, id) {
    if (count !== null || result) return;
    if (player === 1 && p1) return;
    if (player === 2 && p2) return;

    const next1 = player === 1 ? id : p1;
    const next2 = player === 2 ? id : p2;
    if (player === 1) setP1(id); else setP2(id);

    if (next1 && next2) beginCountdown(next1, next2);
  }

  function beginCountdown(a, b) {
    let n = 3;
    setCount(n);
    timer.current = setInterval(() => {
      n -= 1;
      if (n > 0) {
        setCount(n);
      } else {
        clearInterval(timer.current);
        timer.current = null;
        setCount(0);
        const outcome = resultText(a, b);
        setResult(outcome);
        if (a !== b) {
          if (beats[a] === b) setScore1(s => s + 1);
          else setScore2(s => s + 1);
        }
      }
    }, 1000);
  }

  function nextRound() {
    resetRound();
    setRound(r => r + 1);
  }

  function backHome() {
    resetRound();
    setRound(1); setScore1(0); setScore2(0);
    setScreen("home");
  }

  function ChoiceButton({ item, selected, disabled, onPress }) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.label}
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.choice,
          { borderColor: item.color, backgroundColor: selected ? item.color : "#202B50" },
          pressed && styles.pressed,
          disabled && !selected && styles.disabled
        ]}
      >
        <Text style={styles.choiceEmoji}>{item.emoji}</Text>
        <Text style={styles.choiceLabel}>{item.label}</Text>
      </Pressable>
    );
  }

  function PlayerPanel({ player, selection, score, onChoose, top }) {
    const locked = !!selection;
    return (
      <View style={[styles.playerPanel, top ? styles.playerTop : styles.playerBottom]}>
        <View style={styles.playerHeader}>
          <View>
            <Text style={styles.playerName}>{player}</Text>
            <Text style={styles.playerHint}>{locked ? "تم الاختيار ✓" : "اختر رمزك بسرية"}</Text>
          </View>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>⭐ {score}</Text>
          </View>
        </View>
        <View style={styles.choicesRow}>
          {choices.map(item => (
            <ChoiceButton
              key={item.id}
              item={item}
              selected={false}
              disabled={locked || count !== null || !!result}
              onPress={() => onChoose(item.id)}
            />
          ))}
        </View>
      </View>
    );
  }

  if (screen === "home") {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#101936" />
        <ScrollView contentContainerStyle={styles.home}>
          <View style={styles.logoMark}><Text style={styles.logoEmoji}>✊ ✋ ✌️</Text></View>
          <Text style={styles.logo}>ROCK <Text style={styles.logoGold}>MAX</Text></Text>
          <Text style={styles.arabicTitle}>حجر ورقة مقص</Text>
          <Text style={styles.tagline}>العب • نافس • افُز</Text>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>جاهز للتحدي؟</Text>
            <Text style={styles.heroText}>واجه صديقك على نفس الهاتف، دون الحاجة إلى الإنترنت.</Text>
            <Pressable style={styles.primaryButton} onPress={startGame}>
              <Text style={styles.primaryButtonText}>لاعبان على هاتف واحد</Text>
            </Pressable>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>قريباً في ROCK MAX</Text>
            <Text style={styles.infoText}>🌐 اللعب عبر الإنترنت</Text>
            <Text style={styles.infoText}>👤 حساب برقم الهاتف ومعرّف لاعب</Text>
            <Text style={styles.infoText}>🏆 بطولات وجمهور وهدايا</Text>
          </View>
          <Text style={styles.footer}>الإصدار الأول التجريبي</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#101936" />
      <View style={styles.game}>
        <View style={styles.topBar}>
          <Pressable onPress={backHome} style={styles.backButton}><Text style={styles.backText}>‹ رجوع</Text></Pressable>
          <Text style={styles.roundText}>الجولة {round}</Text>
          <Text style={styles.modeText}>دون إنترنت</Text>
        </View>

        <PlayerPanel player="اللاعب الأول" selection={p1} score={score1} onChoose={id => choose(1, id)} top />

        <View style={styles.centerStage}>
          <Text style={styles.vs}>VS</Text>
          {count !== null && count > 0 && <Text style={styles.count}>{count}</Text>}
          {count === 0 && result ? (
            <>
              <Text style={styles.resultTitle}>{result}</Text>
              <View style={styles.revealRow}>
                <Text style={styles.reveal}>{choices.find(c => c.id === p1)?.emoji}</Text>
                <Text style={styles.revealVs}>×</Text>
                <Text style={styles.reveal}>{choices.find(c => c.id === p2)?.emoji}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.stageHint}>
              {p1 && p2 ? "استعد لإعلان النتيجة!" : "يختار كل لاعب رمزه"}
            </Text>
          )}
          {result ? (
            <Pressable style={styles.nextButton} onPress={nextRound}>
              <Text style={styles.nextButtonText}>الجولة التالية</Text>
            </Pressable>
          ) : (
            <Text style={styles.secretHint}>🔒 الاختيارات مخفية حتى إعلان النتيجة</Text>
          )}
        </View>

        <PlayerPanel player="اللاعب الثاني" selection={p2} score={score2} onChoose={id => choose(2, id)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#101936" },
  home: { flexGrow: 1, padding: 22, alignItems: "center", justifyContent: "center" },
  logoMark: { width: 116, height: 92, borderRadius: 28, backgroundColor: "#25345F", borderWidth: 2, borderColor: "#F6C453", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  logoEmoji: { fontSize: 29 },
  logo: { color: "#FFFFFF", fontSize: 38, fontWeight: "900", letterSpacing: 1 },
  logoGold: { color: "#F6C453" },
  arabicTitle: { color: "#FFFFFF", fontSize: 25, fontWeight: "900", marginTop: 5 },
  tagline: { color: "#F6C453", fontSize: 14, marginTop: 7, marginBottom: 25 },
  heroCard: { width: "100%", backgroundColor: "#1D2A50", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#42568A" },
  heroTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", textAlign: "center" },
  heroText: { color: "#D8E1FF", fontSize: 15, textAlign: "center", lineHeight: 24, marginVertical: 12 },
  primaryButton: { backgroundColor: "#F6C453", borderRadius: 16, padding: 16, alignItems: "center", marginTop: 5 },
  primaryButtonText: { color: "#182344", fontSize: 17, fontWeight: "900" },
  infoCard: { width: "100%", backgroundColor: "#172342", borderRadius: 20, padding: 18, marginTop: 16 },
  infoTitle: { color: "#F6C453", fontSize: 17, fontWeight: "900", marginBottom: 10, textAlign: "right" },
  infoText: { color: "#E7ECFF", fontSize: 14, textAlign: "right", marginVertical: 4 },
  footer: { color: "#8290B7", marginTop: 18, fontSize: 12 },
  game: { flex: 1, padding: 12 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  backButton: { padding: 8 },
  backText: { color: "#F6C453", fontWeight: "800", fontSize: 15 },
  roundText: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },
  modeText: { color: "#A9B8E5", fontSize: 12 },
  playerPanel: { backgroundColor: "#1D2A50", borderRadius: 20, padding: 12, borderWidth: 1, borderColor: "#354777" },
  playerTop: { marginTop: 6 },
  playerBottom: { marginBottom: 6 },
  playerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  playerName: { color: "#FFFFFF", fontWeight: "900", fontSize: 17, textAlign: "right" },
  playerHint: { color: "#B8C5E8", fontSize: 12, marginTop: 3, textAlign: "right" },
  scorePill: { backgroundColor: "#354777", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7 },
  scoreText: { color: "#F6C453", fontWeight: "900" },
  choicesRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  choice: { flex: 1, minHeight: 86, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  choiceEmoji: { fontSize: 30 },
  choiceLabel: { color: "#FFFFFF", fontWeight: "800", marginTop: 4 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.45 },
  centerStage: { flex: 1, minHeight: 150, alignItems: "center", justifyContent: "center", paddingVertical: 8 },
  vs: { color: "#F6C453", fontSize: 28, fontWeight: "900", letterSpacing: 3 },
  count: { color: "#FFFFFF", fontSize: 58, fontWeight: "900", marginVertical: 2 },
  stageHint: { color: "#D8E1FF", fontSize: 14, marginTop: 8, textAlign: "center" },
  secretHint: { color: "#9EADD6", fontSize: 11, marginTop: 10, textAlign: "center" },
  resultTitle: { color: "#F6C453", fontSize: 22, fontWeight: "900", textAlign: "center", marginTop: 5 },
  revealRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  reveal: { fontSize: 38, marginHorizontal: 10 },
  revealVs: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  nextButton: { backgroundColor: "#F6C453", borderRadius: 14, paddingHorizontal: 24, paddingVertical: 10, marginTop: 8 },
  nextButtonText: { color: "#182344", fontWeight: "900", fontSize: 15 }
});
