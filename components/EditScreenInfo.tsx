import React from 'react';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useUnifiedStore } from '@/stores/useUnifiedStore';

export default function EditScreenInfo({ path }: { path: string }) {
  const { themeColors } = useUnifiedStore();

  return (
    <View style={{ backgroundColor: themeColors.bgColor(1) }}>
        <View
          style={[styles.codeHighlightContainer, styles.homeScreenFilename, { backgroundColor: themeColors.bgColor(0.05) }]}
        >
          <Text style={{ fontFamily: 'monospace', color: themeColors.textColor }}>{path}</Text>
        </View>
        <View style={[styles.codeHighlightContainer, styles.homeScreenFilename, { backgroundColor: themeColors.bgColor(0.05) }]}>
          <Text style={{ fontFamily: 'monospace', color: themeColors.textColor }}>{path}</Text>
        </View>
        <View style={[styles.codeHighlightContainer, styles.homeScreenFilename, { backgroundColor: themeColors.bgColor(0.05) }]}>
          <Text style={{ fontFamily: 'monospace', color: themeColors.textColor }}>{path}</Text>
        </View>
        <View style={[styles.codeHighlightContainer, styles.homeScreenFilename, { backgroundColor: themeColors.bgColor(0.05) }]}>
          <Text style={{ fontFamily: 'monospace', color: themeColors.textColor }}>{path}</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: 'center',
  },
});
